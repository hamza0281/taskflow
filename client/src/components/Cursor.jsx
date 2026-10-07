import { useEffect, useRef } from "react";

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    // do nothing on touch devices
    if (window.matchMedia("(hover: none)").matches) return;

    document.body.classList.add("has-cursor");
    let x = 0, y = 0, rx = 0, ry = 0, raf;

    const move = (e) => {
      x = e.clientX; y = e.clientY;
      dot.current.style.opacity = 1;
      ring.current.style.opacity = 1;
      dot.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    const setState = (state) => { ring.current.className = `cursor-ring ${state}`; };
    const over = (e) => {
      const t = e.target;
      if (t.closest("input, textarea")) setState("text");
      else if (t.closest(".task")) setState("grab");
      else if (t.closest("a, button, select, label, .project-card")) setState("hover");
      else setState("");
    };
    const down = () => ring.current.classList.add("down");
    const up = () => ring.current.classList.remove("down");
    const leave = () => { dot.current.style.opacity = 0; ring.current.style.opacity = 0; };

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.addEventListener("mouseleave", leave);
    raf = requestAnimationFrame(loop);

    return () => {
      document.body.classList.remove("has-cursor");
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dot} />
      <div className="cursor-ring" ref={ring}><span /></div>
    </>
  );
}