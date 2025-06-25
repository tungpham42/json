import React, { useEffect, useRef } from "react";
import JSONViewer from "json-viewer-js";

interface Props {
  json: object;
}

const JsonTreeView: React.FC<Props> = ({ json }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "";
      new JSONViewer({ container: ref.current, theme: "light" }).showJSON(json);
    }
  }, [json]);

  return <div className="json-viewer" ref={ref} />;
};

export default JsonTreeView;
