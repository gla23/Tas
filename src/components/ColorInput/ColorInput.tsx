import { FunctionComponent, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useResize } from "../../hooks/useResize";
import { useSelectionInput } from "../../hooks/useSelectionInput";
import { childIndex } from "./selectionSet";
import "./ColorInput.css";
import { useRAF } from "../../hooks/useRAF";

interface ColorInputProps {
  id?: string;
  value: string;
  autoFocus?: boolean;
  width?: string;
  fontSize?: string;
  onChange: (value: string) => void;
  debug?: boolean;
  charClass?: CharClass;
}
interface CharClass {
  (
    inSelection: boolean,
    character: string,
    index: number,
    string: string
  ): string;
}
export const Scrollable: FunctionComponent<{
  className?: string;
}> = function Scrollable(props) {
  return (
    <div className={"scrollableOuter "}>
      <div className={"scrollable " + props.className}>{props.children}</div>
      <div className="textareaRoot" />
    </div>
  );
};

export function ColorInput(props: ColorInputProps) {
  const { current: randomId } = useRef(
    "ColorInput" + String(Math.random()).slice(5, 13)
  );
  const id = props.id || randomId;
  const textareaRoot = document.querySelector("div.textareaRoot");
  const [focused, setFocused] = useState(false);
  const [cursorOn, setCursorOn] = useState(true);
  const [dragStart, setDragStart] = useState<null | number>(null);
  const textarea = useSelectionInput();
  const [request] = useRAF();
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const { width: paragraphWidth } = useResize(paragraphRef);

  useEffect(() => {
    if (!focused) return;
    setCursorOn(true);
    let flashInterval = setInterval(() => setCursorOn((old) => !old), 600);
    return () => clearInterval(flashInterval);
  }, [focused, textarea.selection]);

  useEffect(() => {
    const callback = (event: MouseEvent) => {
      if (dragStart === null) return;
      request(() => {
        const dragEnd = childIndex(event, paragraphRef);
        textarea.setSelection(
          dragEnd > dragStart
            ? [dragStart, dragEnd, "forward"]
            : [dragEnd, dragStart, "backward"]
        );
      });
    };
    document.body.addEventListener("mousemove", callback);
    return () => document.body.removeEventListener("mousemove", callback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragStart]);

  useEffect(() => {
    const callback = (event: MouseEvent) => {
      if (dragStart === null) return;
      textarea.focus();
      setDragStart(null);
    };
    document.body.addEventListener("mouseup", callback);
    return () => document.body.removeEventListener("mouseup", callback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragStart]);

  const {
    width = "100%",
    fontSize = "3rem",
    charClass = (sel, char, i, s) =>
      sel ? "bg-blue-300 bg-opacity-50" : "inherit",
    debug,
  } = props;

  const spans = useMemo(() => {
    // console.log(
    //   "spans",
    //   props.value,
    //   textarea.selection[0],
    //   textarea.selection[1]
    // );
    const spans: JSX.Element[] = [];
    Array.prototype.forEach.call(props.value + " ", (char, index) => {
      let className = "";
      if (index === textarea.cursorIndex) className += "cursor ";
      if (index < props.value.length)
        className += charClass(
          textarea.withinSelection(index),
          char,
          index,
          props.value
        );
      spans.push(
        <span className={className} key={index}>
          {char}
        </span>
      );
    });
    return spans;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value, textarea.selection[0], textarea.selection[1]]);

  if (!textareaRoot) return null;
  return (
    <div className="ColorInput">
      <p
        className={
          "ColorInput " + (cursorOn && (focused || dragStart) ? "cursorOn" : "")
        }
        ref={paragraphRef}
        style={{ width, fontSize }}
        onMouseDown={(e) => {
          const index = childIndex(e, paragraphRef);
          textarea.setSelection([index, index, "none"]);
          setDragStart(index);
        }}
      >
        {spans}
      </p>
      {ReactDOM.createPortal(
        <textarea
          id={id}
          {...textarea.props}
          style={{
            position: debug ? "initial" : "absolute",
            left: "200vw",
            width: paragraphWidth + "px",
            fontSize,
          }}
          className="ColorInput"
          onChange={(e) => props.onChange(e.target.value)}
          spellCheck={false}
          value={props.value}
          autoFocus={props.autoFocus}
          // onSelect={(e) => setSelection(e.target as any)}
          // onKeyPress={(e) => setSelection(e.target as any)}
          // onKeyUp={(e) => setSelection(e.target as any)}
          // onInput={(e) => setSelection(e.target as any)}
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={() => {
            setFocused(false);
          }}
        />,
        textareaRoot
      )}
    </div>
  );
}
