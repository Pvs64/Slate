import {memo} from "react" 
import { useStorage } from "@/liveblocks.config" 
import {  LayerType } from "@/types/canvas" 
import { Rectangle } from "./rectangle";
import {Ellipse} from "./ellipse"
import {Text} from "./text"
import {Note} from "./note"
import {Path} from   "./path"
import {Polygon} from "./polygon"
import {CodeBlock} from "./code-block"
import {Connector} from "./connector"
import {SystemShape} from "./system-shape"
import {Kanban} from "./kanban"
import {StudyPlanner} from "./study-planner"
import {MindMap} from "./mind-map"
import {StudentTable} from "./student-table"
import {Equation} from "./equation"
import {PdfPreview} from "./pdf-layer"
import {FrameComponent} from "./frame-layer"
import {colorToCss} from "@/lib/utils"

interface LayerPreviewProps { 
    id: string, 
    onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void, 
    selectionColor?: string, 
} 

export const LayerPreview = memo(({
     id, 
     onLayerPointerDown, 
     selectionColor , 
    }: LayerPreviewProps) => {
         const layer = useStorage((root)=> root.layers.get(id));

         if(!layer) {return null;} 

         const renderElement = () => {
           switch(layer.type){ 
             case LayerType.Path:
               if (!layer.points || !Array.isArray(layer.points) || layer.points.length === 0) {
                 return null;
               }
               return(
                 <Path
                   key={id}
                   points={layer.points}
                   onPointerDown={(e) => onLayerPointerDown(e, id)}
                   x={layer.x}
                   y={layer.y}
                   fill={layer.fill ? colorToCss(layer.fill) : "#000"}
                   stroke={selectionColor}
                   strokeWidth={layer.strokeWidth || 3}
                 />
               );

             case LayerType.Note:
             case LayerType.Callout:
               return(
                 <Note
                   id={id}
                   layer={layer}
                   onPointerDown={onLayerPointerDown}
                   selectionColor={selectionColor}
                 />
               );

             case LayerType.Text:
               return(
                 <Text
                   id={id}
                   layer={layer}
                   onPointerDown={onLayerPointerDown}
                   selectionColor={selectionColor}
                 />
               );

             case LayerType.Ellipse:
               return(
                 <Ellipse
                   id={id}
                   layer={layer}
                   onPointerDown={onLayerPointerDown}
                   selectionColor={selectionColor}
                 />
               );

             case LayerType.Triangle:
             case LayerType.Diamond:
             case LayerType.Star:
             case LayerType.Hexagon:
               return(
                 <Polygon
                   id={id}
                   layer={layer}
                   onPointerDown={onLayerPointerDown}
                   selectionColor={selectionColor}
                 />
               );

             case LayerType.Code:
               return(
                 <CodeBlock
                   id={id}
                   layer={layer}
                   onPointerDown={onLayerPointerDown}
                   selectionColor={selectionColor}
                 />
               );

             case LayerType.Connector:
             case LayerType.ArrowConnector:
               return(
                 <Connector
                   id={id}
                   layer={layer}
                   onPointerDown={onLayerPointerDown}
                   selectionColor={selectionColor}
                 />
               );

             case LayerType.SystemShape:
               return(
                 <SystemShape
                   id={id}
                   layer={layer}
                   onPointerDown={onLayerPointerDown}
                   selectionColor={selectionColor}
                 />
               );

             case LayerType.Kanban:
               return(
                 <Kanban
                   id={id}
                   layer={layer}
                   onPointerDown={onLayerPointerDown}
                   selectionColor={selectionColor}
                 />
               );

             case LayerType.StudyPlanner:
               return(
                 <StudyPlanner
                   id={id}
                   layer={layer}
                   onPointerDown={onLayerPointerDown}
                   selectionColor={selectionColor}
                 />
               );

             case LayerType.MindMap:
               return <MindMap id={id} layer={layer} onPointerDown={onLayerPointerDown} selectionColor={selectionColor} />;

             case LayerType.Table:
               return <StudentTable id={id} layer={layer} onPointerDown={onLayerPointerDown} selectionColor={selectionColor} />;

             case LayerType.Equation:
               return <Equation id={id} layer={layer} onPointerDown={onLayerPointerDown} selectionColor={selectionColor} />;

             case LayerType.Pdf:
               return <PdfPreview id={id} layer={layer} onPointerDown={onLayerPointerDown} selectionColor={selectionColor} />;

             case LayerType.Frame:
               return <FrameComponent id={id} layer={layer} onPointerDown={onLayerPointerDown} selectionColor={selectionColor} />;

             case LayerType.Reactangle:
               return ( 
                 <Rectangle
                   id={id}
                   layer={layer}
                   onPointerDown={onLayerPointerDown}
                   selectionColor={selectionColor}
                 /> 
               ); 
                       
             default:
               console.warn("Unknown layer type");
               return null;
           }
         };

         const centerX = layer.x + ("width" in layer ? layer.width / 2 : 50);
         const centerY = layer.y + ("height" in layer ? layer.height / 2 : 50);
         const rotation = "rotation" in layer && layer.rotation ? layer.rotation : 0;
         const opacity = "opacity" in layer && layer.opacity != null ? layer.opacity : 1;

         if (rotation || opacity !== 1) {
           return (
             <g
               transform={rotation ? `rotate(${rotation} ${centerX} ${centerY})` : undefined}
               opacity={opacity}
             >
               {renderElement()}
             </g>
           );
         }

         return renderElement();
    })
                
     LayerPreview.displayName = "LayerPreview"