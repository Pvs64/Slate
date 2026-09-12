export type Color = {
    r: number,
    g: number,
    b: number,
    gradient?: string,
}

export type Camera = {
    x: number,
    y: number,
    zoom: number,
}

export enum LayerType {
  Reactangle,
  Ellipse,
  Triangle,
  Diamond,
  Star,
  Hexagon,
  Code,
  Connector,
  ArrowConnector,
  SystemShape,
  Kanban,
  StudyPlanner,
  MindMap,
  Table,
  Equation,
  Pdf,
  Path,
  Text,
  Note,
  Callout,
  Frame,
}

export type BaseLayerProps = {
  rotation?: number;
  opacity?: number;
  isLocked?: boolean;
  groupId?: string;
  borderColor?: Color;
  borderWidth?: number;
};

export type RectangleLayer = BaseLayerProps & {
  type: LayerType.Reactangle;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value?: string;
  cornerRadius?: number;
};

export type EllipseLayer = BaseLayerProps & {
  type: LayerType.Ellipse;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value?: string;
};

export type PolygonLayer = BaseLayerProps & {
  type: LayerType.Triangle | LayerType.Diamond | LayerType.Star | LayerType.Hexagon;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value?: string;
};

export type PathLayer = BaseLayerProps & {
  type: LayerType.Path;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  points: number[][];
  value?: string;
  strokeWidth?: number;
};

export type TextLayer = BaseLayerProps & {
  type: LayerType.Text;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline" | "line-through";
  textAlign?: "left" | "center" | "right";
  highlight?: Color;
};

export type NoteLayer = BaseLayerProps & {
  type: LayerType.Note | LayerType.Callout;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline" | "line-through";
  textAlign?: "left" | "center" | "right";
  highlight?: Color;
};

export type FrameLayer = BaseLayerProps & {
  type: LayerType.Frame;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: Color;
  title: string;
  order?: number;
};

export type CodeLayer = BaseLayerProps & {
  type: LayerType.Code;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value?: string;
  language?: string;
  dark?: boolean;
};

export type ConnectorLayer = BaseLayerProps & {
  type: LayerType.Connector | LayerType.ArrowConnector;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  arrow?: boolean;
  arrowStart?: boolean;
  arrowEnd?: boolean;
  dashed?: boolean;
  strokeWidth?: number;
  style?: "straight" | "elbow" | "curved";
  startLayerId?: string;
  endLayerId?: string;
  startPoint?: Point;
  endPoint?: Point;
};

export type SystemShapeLayer = BaseLayerProps & {
  type: LayerType.SystemShape;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value?: string;
  shapeKind?: "Client" | "API Gateway" | "Server" | "Database" | "Cache" | "Queue" | "Worker" | "Load Balancer" | "Cloud" | "User" | "Process" | "Decision" | "Document";
};

export type KanbanColumn = {
  title: string;
  tasks: string[];
};

export type KanbanLayer = BaseLayerProps & {
  type: LayerType.Kanban;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value?: string;
};

export type StudyPlannerLayer = BaseLayerProps & {
  type: LayerType.StudyPlanner;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value?: string;
};

export type StudentLayer = BaseLayerProps & {
  type: LayerType.MindMap | LayerType.Table | LayerType.Equation;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value?: string;
};

export type PdfLayer = BaseLayerProps & {
  type: LayerType.Pdf;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  src: string;
  name: string;
  mediaType?: "pdf" | "image";
};

export type Point = {
  x: number;
  y: number;
};

export type XYWH = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export enum Side {
  Top = 1,
  Bottom = 2,
  Left = 4,
  Right = 8,
}

export type CanvasState =
  | {
      mode: CanvasMode.None;
    }
  | {
      mode: CanvasMode.SelectionNet;
      origin: Point;
      current?: Point;
    }
  | {
      mode: CanvasMode.Translating;
      current: Point;
    }
  | {
      mode: CanvasMode.Inserting;
      layerType: LayerType;
      connectorStyle?: "straight" | "elbow" | "curved";
    }
  | {
      mode: CanvasMode.Pencil;
    }
  | {
      mode: CanvasMode.Pressing;
      origin: Point;
    }
  | {
      mode: CanvasMode.Resizing;
      initialBounds: XYWH;
      corner: Side;
    }
  | {
      mode: CanvasMode.Rotating;
      initialAngle: number;
      center: Point;
    };

export enum CanvasMode {
  None,
  Pressing,
  SelectionNet,
  Translating,
  Inserting,
  Resizing,
  Pencil,
  Rotating,
}

export type Layer =
  | RectangleLayer
  | EllipseLayer
  | PolygonLayer
  | CodeLayer
  | ConnectorLayer
  | SystemShapeLayer
  | KanbanLayer
  | StudyPlannerLayer
  | StudentLayer
  | PdfLayer
  | PathLayer
  | TextLayer
  | NoteLayer
  | FrameLayer;