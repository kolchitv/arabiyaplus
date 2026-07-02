import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { v4 as uuid } from "uuid";
import type { BookPage, Hotspot, HotspotShape } from "@/types/book";
import { useBookStore } from "@/store/bookStore";
import { useUiStore } from "@/store/uiStore";
import { useMediaStore } from "@/store/mediaStore";

interface Props {
  page: BookPage;
}

const HOTSPOT_FILL = "rgba(231, 163, 61, 0.28)";
const HOTSPOT_STROKE = "#E7A33D";

/** Fabric object custom data we attach to identify which hotspot it represents. */
type HotspotFabricObject = fabric.Object & { hotspotId?: string };

export function PageCanvas({ page }: Props) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const drawingRef = useRef<{ shape: fabric.Object; startX: number; startY: number } | null>(null);

  const activeTool = useUiStore((s) => s.activeTool);
  const setActiveTool = useUiStore((s) => s.setActiveTool);
  const selectHotspot = useUiStore((s) => s.selectHotspot);
  const zoom = useUiStore((s) => s.zoom);
  const showGrid = useUiStore((s) => s.showGrid);

  const addHotspot = useBookStore((s) => s.addHotspot);
  const updateHotspot = useBookStore((s) => s.updateHotspot);
  const getAsset = useMediaStore((s) => s.getAsset);
  const hydrateBlobUrl = useMediaStore((s) => s.hydrateBlobUrl);

  // --- Initialize the Fabric canvas once ---------------------------------
  useEffect(() => {
    if (!canvasElRef.current) return;
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: page.width,
      height: page.height,
      selection: true,
      backgroundColor: "#FFFFFF"
    });
    fabricRef.current = canvas;

    canvas.on("selection:created", (e) => {
      const obj = e.selected?.[0] as HotspotFabricObject | undefined;
      selectHotspot(obj?.hotspotId ?? null);
    });
    canvas.on("selection:cleared", () => selectHotspot(null));

    canvas.on("object:modified", (e) => {
      const obj = e.target as HotspotFabricObject | undefined;
      if (!obj?.hotspotId) return;
      commitGeometry(obj);
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  // --- Load / update background image -------------------------------------
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !page.backgroundImageId) return;

    let asset = getAsset(page.backgroundImageId);
    (async () => {
      if (asset && !asset.url) {
        const url = await hydrateBlobUrl(page.backgroundImageId!);
        if (url) asset = { ...asset, url };
      }
      if (!asset?.url) return;
      const img = await fabric.FabricImage.fromURL(asset.url, { crossOrigin: "anonymous" });
      img.set({
        scaleX: page.width / (img.width || page.width),
        scaleY: page.height / (img.height || page.height),
        selectable: false,
        evented: false
      });
      canvas.backgroundImage = img;
      canvas.requestRenderAll();
    })();
  }, [page.backgroundImageId, page.width, page.height, getAsset, hydrateBlobUrl]);

  // --- Render hotspots from store state -----------------------------------
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const existing = new Map(
      canvas.getObjects().map((o) => [(o as HotspotFabricObject).hotspotId, o])
    );

    // Remove fabric objects for hotspots no longer in the store
    for (const [id, obj] of existing) {
      if (id && !page.hotspots.find((h) => h.id === id)) {
        canvas.remove(obj);
      }
    }

    // Add or update objects for current hotspots
    for (const hotspot of page.hotspots) {
      const current = existing.get(hotspot.id) as HotspotFabricObject | undefined;
      if (current) {
        syncFabricFromHotspot(current, hotspot, page);
      } else {
        const shape = createFabricShape(hotspot, page);
        canvas.add(shape);
      }
    }
    canvas.requestRenderAll();
  }, [page.hotspots, page.width, page.height]);

  // --- Drawing new hotspots with rectangle/circle tools -------------------
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.selection = activeTool === "select";
    canvas.forEachObject((o) => (o.selectable = activeTool === "select"));

    if (activeTool !== "rectangle" && activeTool !== "circle") return;

    function onMouseDown(e: fabric.TPointerEventInfo<fabric.TPointerEvent>) {
      const pointer = canvas!.getScenePoint(e.e);
      const shape: fabric.Object =
        activeTool === "rectangle"
          ? new fabric.Rect({
              left: pointer.x,
              top: pointer.y,
              width: 1,
              height: 1,
              fill: HOTSPOT_FILL,
              stroke: HOTSPOT_STROKE,
              strokeWidth: 2,
              rx: 6,
              ry: 6
            })
          : new fabric.Circle({
              left: pointer.x,
              top: pointer.y,
              radius: 1,
              fill: HOTSPOT_FILL,
              stroke: HOTSPOT_STROKE,
              strokeWidth: 2
            });
      canvas!.add(shape);
      drawingRef.current = { shape, startX: pointer.x, startY: pointer.y };
    }

    function onMouseMove(e: fabric.TPointerEventInfo<fabric.TPointerEvent>) {
      const drawing = drawingRef.current;
      if (!drawing) return;
      const pointer = canvas!.getScenePoint(e.e);
      const { shape, startX, startY } = drawing;

      if (shape instanceof fabric.Rect) {
        shape.set({
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
          width: Math.abs(pointer.x - startX),
          height: Math.abs(pointer.y - startY)
        });
      } else if (shape instanceof fabric.Circle) {
        const radius = Math.hypot(pointer.x - startX, pointer.y - startY) / 2;
        shape.set({
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
          radius
        });
      }
      canvas!.requestRenderAll();
    }

    function onMouseUp() {
      const drawing = drawingRef.current;
      drawingRef.current = null;
      if (!drawing) return;
      const { shape } = drawing;

      // Ignore accidental zero-size clicks
      const w = shape.getScaledWidth();
      const h = shape.getScaledHeight();
      if (w < 6 || h < 6) {
        canvas!.remove(shape);
        return;
      }

      const hotspot: Hotspot = {
        id: uuid(),
        name: activeTool === "rectangle" ? "منطقة تفاعلية" : "منطقة تفاعلية دائرية",
        shape: activeTool as HotspotShape,
        x: shape.left! / page.width,
        y: shape.top! / page.height,
        width: w / page.width,
        height: h / page.height,
        rotation: 0,
        action: null,
        color: HOTSPOT_STROKE
      };
      canvas!.remove(shape); // the store-driven effect above will re-add the real one
      addHotspot(page.id, hotspot);
      setActiveTool("select");
    }

    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", onMouseUp);
    return () => {
      canvas.off("mouse:down", onMouseDown);
      canvas.off("mouse:move", onMouseMove);
      canvas.off("mouse:up", onMouseUp);
    };
  }, [activeTool, page.id, page.width, page.height, addHotspot, setActiveTool]);

  function commitGeometry(obj: HotspotFabricObject) {
    if (!obj.hotspotId) return;
    const w = obj.getScaledWidth();
    const h = obj.getScaledHeight();
    updateHotspot(page.id, obj.hotspotId, {
      x: obj.left! / page.width,
      y: obj.top! / page.height,
      width: w / page.width,
      height: h / page.height,
      rotation: obj.angle ?? 0
    });
  }

  return (
    <div
      className={showGrid ? "editor-canvas-surface inline-block shadow-soft" : "inline-block shadow-soft"}
      style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
    >
      <canvas ref={canvasElRef} />
    </div>
  );
}

function createFabricShape(hotspot: Hotspot, page: BookPage): HotspotFabricObject {
  const common = {
    fill: HOTSPOT_FILL,
    stroke: hotspot.color ?? HOTSPOT_STROKE,
    strokeWidth: 2,
    left: hotspot.x * page.width,
    top: hotspot.y * page.height,
    angle: hotspot.rotation,
    hasRotatingPoint: true
  };

  let shape: fabric.Object;
  if (hotspot.shape === "circle") {
    shape = new fabric.Circle({ ...common, radius: (hotspot.width * page.width) / 2 });
  } else {
    // rectangle is the default renderer for polygon/freedraw until Phase 2 adds
    // dedicated polygon point-editing and freehand path support.
    shape = new fabric.Rect({
      ...common,
      width: hotspot.width * page.width,
      height: hotspot.height * page.height,
      rx: 6,
      ry: 6
    });
  }
  (shape as HotspotFabricObject).hotspotId = hotspot.id;
  return shape as HotspotFabricObject;
}

function syncFabricFromHotspot(obj: HotspotFabricObject, hotspot: Hotspot, page: BookPage) {
  obj.set({
    left: hotspot.x * page.width,
    top: hotspot.y * page.height,
    angle: hotspot.rotation,
    stroke: hotspot.color ?? HOTSPOT_STROKE
  });
  if (obj instanceof fabric.Circle) {
    obj.set({ radius: (hotspot.width * page.width) / 2 });
  } else {
    obj.set({
      width: hotspot.width * page.width,
      height: hotspot.height * page.height
    });
  }
  obj.setCoords();
}
