import React from "react";
import { CodeRender } from "../code-render";

interface TerminalOutputProps {
  data: string;
}

/**
 * TerminalOutput — renders stdout from the executed code as a labeled
 * terminal panel.
 */
export const TerminalOutput: React.FC<TerminalOutputProps> = ({ data }) => (
  <div className="mt-4 fade-in">
    <CodeRender
      code={data}
      language="bash"
      filename="stdout · output"
      status="executed"
    />
  </div>
);
