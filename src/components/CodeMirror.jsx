import React, { useRef, useEffect } from "react";
import { basicSetup, EditorView } from "codemirror";
import { EditorState, Compartment } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { verticalLingRulerPlugin } from "./viewPlugin/verticalLineRulerPlugin/verticalLineRulerPlugin";
import "./css/editStyle.css";
import "./css/verticalLineRulerStyle.css";

function CodeMirror() {
  const editorRef = useRef(null);
  const languageCompartment = useRef(new Compartment()).current;

  useEffect(() => {
    if (editorRef.current) {
      let state = EditorState.create({
        extensions: [
          basicSetup,
          languageCompartment.of(javascript()),
          verticalLingRulerPlugin,
        ],
      });

      const view = new EditorView({
        state,
        parent: editorRef.current,
      });
      return () => {
        view.destroy();
      };
    }
  }, [editorRef, languageCompartment]);

  return (
    <div className="absolute top-10 right-10">
      <div className="w-[1200px] h-[600px]  border-2 border-gray-300 border-solid rounded-xl bg-white text-lg font-bold">
        <div id="editor" ref={editorRef}>
          CodeMirror
        </div>
      </div>
    </div>
  );
}

export default CodeMirror;

let a = 3;
function abc() {
  let b = 3;
}
