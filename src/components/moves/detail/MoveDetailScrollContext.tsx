"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const MoveDetailScrollContext = createContext<HTMLElement | null>(null);

export function MoveDetailScrollProvider({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const setRef = useCallback((node: HTMLDivElement | null) => {
    setScrollEl(node);
  }, []);

  return (
    <MoveDetailScrollContext.Provider value={scrollEl}>
      <div ref={setRef} id="move-detail-scroll" className={className}>
        {children}
      </div>
    </MoveDetailScrollContext.Provider>
  );
}

export function useMoveDetailScrollRoot() {
  return useContext(MoveDetailScrollContext);
}

/** Offset from scroll container top for sticky tab + section nav (px). */
export const MOVE_DETAIL_SECTION_ACTIVATE_OFFSET = 132;

function scrollContainerFor(root: HTMLElement | null): HTMLElement | Window {
  if (root && root.scrollHeight > root.clientHeight + 2) return root;
  return window;
}

export function scrollToMoveDetailSection(
  sectionId: string,
  scrollRoot: HTMLElement | null,
) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  const container = scrollContainerFor(scrollRoot);
  const offset = MOVE_DETAIL_SECTION_ACTIVATE_OFFSET;

  if (container === window) {
    const top =
      target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    return;
  }

  const el = container as HTMLElement;
  const rootTop = el.getBoundingClientRect().top;
  const targetTop = target.getBoundingClientRect().top;
  el.scrollTo({
    top: el.scrollTop + (targetTop - rootTop) - offset,
    behavior: "smooth",
  });
}

export function useSectionScrollSpy(
  sectionIds: readonly string[],
  scrollRoot: HTMLElement | null,
) {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const container = scrollContainerFor(scrollRoot);
    const offset = MOVE_DETAIL_SECTION_ACTIVATE_OFFSET;

    function update() {
      const rootTop =
        container === window ? 0 : (container as HTMLElement).getBoundingClientRect().top;
      const viewBottom =
        container === window
          ? window.innerHeight
          : rootTop + (container as HTMLElement).clientHeight;
      const bandTop = rootTop + offset;

      let bestId = sectionIds[0]!;
      let bestVisible = -1;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        const visibleTop = Math.max(rect.top, bandTop);
        const visibleBottom = Math.min(rect.bottom, viewBottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        if (visibleHeight > bestVisible) {
          bestVisible = visibleHeight;
          bestId = id;
        }
      }

      if (bestVisible <= 0) {
        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (!el) continue;
          const top = el.getBoundingClientRect().top - rootTop;
          if (top <= offset) bestId = id;
        }
      }

      setActiveId(bestId);
    }

    update();
    container.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      container.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [scrollRoot, sectionIds.join("|")]);

  return activeId;
}
