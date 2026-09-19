import React, { useEffect, useLayoutEffect } from "react";
import { gsap } from "gsap";
import "./portada-name.css";
import { SplitText } from "gsap/SplitText";

export default function PortadaName() {
  useEffect(() => {
    const supportsPointerHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    if (!supportsPointerHover) return undefined;

    let timeoutId;
    const cards = document.querySelectorAll(".card.p-logo, .card.a-logo, .card.b-logo, .card.l-logo, .card.o-logo");
    const styleEl = document.querySelector("style.hover");

    // --- 1. Configuración por logo ---
    const logos = {
      "p-logo": {
        src: "/fotos/logos/pez.png",
        img: new Image(),
        canvas: document.createElement("canvas"),
        ctx: null,
        ready: false,
      },
      "a-logo": {
        src: "/fotos/logos/a.png",
        img: new Image(),
        canvas: document.createElement("canvas"),
        ctx: null,
        ready: false,
      },
      "b-logo": {
        src: "/fotos/logos/b.png",
        img: new Image(),
        canvas: document.createElement("canvas"),
        ctx: null,
        ready: false,
      },

      "l-logo": {
        src: "/fotos/logos/l.png",
        img: new Image(),
        canvas: document.createElement("canvas"),
        ctx: null,
        ready: false,
      },

      "o-logo": {
        src: "/fotos/logos/o-complete.png",
        img: new Image(),
        canvas: document.createElement("canvas"),
        ctx: null,
        ready: false,
      },
    };

    // Cargar imágenes y preparar canvas
    Object.entries(logos).forEach(([key, config]) => {
      const { img, canvas } = config;
      config.ctx = canvas.getContext("2d");
      img.src = config.src;
      img.crossOrigin = "anonymous";

      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        config.ctx.drawImage(img, 0, 0);
        config.ready = true;
      };
    });

    function getLogoConfigForCard(card) {
      if (card.classList.contains("p-logo")) return logos["p-logo"];
      if (card.classList.contains("a-logo")) return logos["a-logo"];
      if (card.classList.contains("b-logo")) return logos["b-logo"];
      if (card.classList.contains("l-logo")) return logos["l-logo"];
      if (card.classList.contains("o-logo")) return logos["o-logo"];
      return null;
    }

    function isOpaquePixelInLogo(card, clientX, clientY) {
      const config = getLogoConfigForCard(card);
      if (!config || !config.ready) return false;

      const { img, canvas, ctx } = config;
      const rect = card.getBoundingClientRect();
      const xCard = clientX - rect.left;
      const yCard = clientY - rect.top;

      const cardW = rect.width;
      const cardH = rect.height;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      // Simular background-size: contain; background-position: center;
      const scale = Math.min(cardW / imgW, cardH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;

      const offsetX = (cardW - drawW) / 2;
      const offsetY = (cardH - drawH) / 2;

      // ¿Está dentro del rectángulo donde se pinta el logo?
      if (
        xCard < offsetX ||
        xCard > offsetX + drawW ||
        yCard < offsetY ||
        yCard > offsetY + drawH
      ) {
        return false;
      }

      // Coordenadas dentro del logo
      const xImg = ((xCard - offsetX) / drawW) * imgW;
      const yImg = ((yCard - offsetY) / drawH) * imgH;

      const pixel = ctx.getImageData(Math.floor(xImg), Math.floor(yImg), 1, 1).data;
      const alpha = pixel[3]; // 0–255

      return alpha > 10;
    }

    function handleMove(e) {
      e.preventDefault();
      const card = e.currentTarget;

      const clientX = e.clientX;
      const clientY = e.clientY;

      // Solo seguimos si estamos sobre un píxel opaco del logo
      if (!isOpaquePixelInLogo(card, clientX, clientY)) {
        if (styleEl) styleEl.textContent = "";
        card.removeAttribute("style");
        cards.forEach(c => c.classList.remove("active"));
        return;
      }

      const rect = card.getBoundingClientRect();
      const l = clientX - rect.left;
      const t = clientY - rect.top;

      const h = card.offsetHeight;
      const w = card.offsetWidth;
      const px = Math.abs(Math.floor((100 / w) * l) - 100);
      const py = Math.abs(Math.floor((100 / h) * t) - 100);
      const pa = 50 - px + (50 - py);
      const lp = 50 + (px - 50) / 1.5;
      const tp = 50 + (py - 50) / 1.5;
      const px_spark = 50 + (px - 50) / 7;
      const py_spark = 50 + (py - 50) / 7;
      const p_opc = 20 + Math.abs(pa) * 1.5;
      const ty = ((tp - 50) / 2) * -1;
      const tx = ((lp - 50) / 1.5) * 0.5;

      const grad_pos = `background-position: ${lp}% ${tp}%;`;
      const sprk_pos = `background-position: ${px_spark}% ${py_spark}%;`;
      const opcValue = Math.min(p_opc / 100, 0.45);
      const opc = `opacity: ${opcValue};`;
      const tf = `transform: rotateX(${ty}deg) rotateY(${tx}deg)`;

      // Saber qué selector aplicar
      let logoClass = "";
      if (card.classList.contains("p-logo")) logoClass = "p-logo";
      else if (card.classList.contains("a-logo")) logoClass = "a-logo";
      else if (card.classList.contains("b-logo")) logoClass = "b-logo";
      else if (card.classList.contains("l-logo")) logoClass = "l-logo";
      else if (card.classList.contains("o-logo")) logoClass = "o-logo";

      const dynStyle = `
      .card.${logoClass}:hover:before { ${grad_pos} }  /* gradient */
      .card.${logoClass}:hover:after { ${sprk_pos} ${opc} }   /* sparkles */ 
    `;

      cards.forEach(c => c.classList.remove("active"));
      card.classList.remove("animated");
      card.setAttribute("style", tf);
      if (styleEl) {
        styleEl.textContent = dynStyle;
      }

      clearTimeout(timeoutId);
    }

    function handleEnd(e) {
      const card = e.currentTarget;
      if (styleEl) {
        styleEl.textContent = "";
      }
      card.removeAttribute("style");
      timeoutId = window.setTimeout(() => {
        card.classList.add("animated");
      }, 2500);
    }

    cards.forEach(card => {
      card.addEventListener("mousemove", handleMove);
      card.addEventListener("mouseleave", handleEnd);
    });

    return () => {
      cards.forEach(card => {
        card.removeEventListener("mousemove", handleMove);
        card.removeEventListener("mouseleave", handleEnd);
      });
      clearTimeout(timeoutId);
    };
  }, []);


  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.registerPlugin(SplitText)
      let split = SplitText.create(".split", { type: "words" });

      gsap.from(".cards .card", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
      });

      gsap.from(split.words, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
      });


    });

    return () => ctx.revert(); // limpia animaciones y restores
  }, []);


  return (
    <>
      <style className="hover" />
      <main>
        <div className="portada">

          <section className="cards">
            <div className="card p-logo animated"></div>
            <div className="card a-logo animated"></div>
            <div className="card b-logo animated"></div>
            <div className="card l-logo animated"></div>
            <div className="card o-logo animated"></div>
          </section>
          <div className="sub-titulo">
            <p className="split">Pablo Conejos</p>
            <p className="split">Developer</p>
          </div>
        </div>
      </main>
    </>


  );
}
