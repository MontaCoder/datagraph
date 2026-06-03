import { Sandbox } from "@e2b/code-interpreter";

export interface CodeInterpreterOutput {
  type: string;
  // most outputs are plain strings; display_data carries a mime-keyed object
  // (e.g. { "image/png": "<base64>" })
  data: string | { [mime: string]: string };
}

interface CodeInterpreterError {
  message: string;
}

export interface CodeInterpreterResponseData {
  session_id: string;
  status: string;
  outputs: CodeInterpreterOutput[];
  errors?: CodeInterpreterError[];
}

interface RunPythonResult {
  session_id: string | null;
  status: string;
  outputs: CodeInterpreterOutput[];
  errors?: CodeInterpreterError[];
  error_message?: string;
}

const EXECUTION_TIMEOUT_MS = 60_000;
const REQUEST_TIMEOUT_MS = 65_000;

/**
 * Executes Python code using E2B Code Interpreter Sandbox and returns the result.
 * @param code The Python code to execute
 * @param session_id Optional sandbox ID to reconnect to an existing session
 * @returns The output of the executed code as JSON
 */
export async function runPython(
  code: string,
  session_id?: string,
  _files?: Array<{ name: string; encoding?: string; content: string }>,
  options?: {
    signal?: AbortSignal;
  }
): Promise<RunPythonResult> {
  let sandbox: Sandbox | null = null;
  const shouldCleanupSandbox = !session_id;

  const handleAbort = () => {
    if (!sandbox || !shouldCleanupSandbox) return;
    void sandbox.kill().catch(() => undefined);
  };

  if (options?.signal) {
    if (options.signal.aborted) {
      handleAbort();
    } else {
      options.signal.addEventListener("abort", handleAbort, { once: true });
    }
  }

  try {
    sandbox = session_id
      ? await Sandbox.connect(session_id)
      : await Sandbox.create({ timeoutMs: EXECUTION_TIMEOUT_MS + 15_000 });

    if (options?.signal?.aborted) {
      return {
        status: "error",
        error_message: "Request aborted",
        session_id:
          sandbox.sandboxId ||
          (sandbox as unknown as { id?: string }).id ||
          null,
        outputs: [],
        errors: [{ message: "Request aborted" }],
      };
    }

    if (_files && _files.length > 0) {
      await sandbox.files.writeFiles(
        _files.map((file) => ({
          path: file.name.startsWith("/") ? file.name : `/${file.name}`,
          data: file.content,
        })),
        {
          requestTimeoutMs: REQUEST_TIMEOUT_MS,
          signal: options?.signal,
        }
      );
    }

    const execution = await sandbox.runCode(code, {
      timeoutMs: EXECUTION_TIMEOUT_MS,
      requestTimeoutMs: REQUEST_TIMEOUT_MS,
    });

    const outputs: CodeInterpreterOutput[] = [];

    // Capture standard output
    if (execution.logs?.stdout) {
      for (const line of execution.logs.stdout) {
        outputs.push({ type: "stdout", data: line });
      }
    }

    // Capture standard error
    if (execution.logs?.stderr) {
      for (const line of execution.logs.stderr) {
        outputs.push({ type: "stderr", data: line });
      }
    }

    // Capture results (e.g. text/prints, or matplotlib images)
    if (execution.results) {
      for (const result of execution.results) {
        if (result.png) {
          outputs.push({
            type: "display_data",
            data: { "image/png": result.png }, // raw mime-keyed object, no JSON.stringify
          });
        } else if (result.text) {
          outputs.push({ type: "stdout", data: result.text });
        }
      }
    }

    const hasError = !!execution.error;

    return {
      session_id:
        sandbox.sandboxId ||
        (sandbox as unknown as { id?: string }).id ||
        null,
      status: hasError ? "error" : "success",
      outputs,
      errors: hasError
        ? [
            {
              message:
                (Array.isArray(execution.error?.traceback)
                  ? execution.error.traceback.join("\n")
                  : (execution.error?.traceback as string)) ||
                execution.error?.value ||
                execution.error?.name ||
                "Execution error",
            },
          ]
        : undefined,
    };
  } catch (e) {
    const messageText = e instanceof Error ? e.message : String(e);
    return {
      status: "error",
      error_message: messageText,
      session_id: null,
      outputs: [],
      errors: [
        {
          message: messageText,
        },
      ],
    };
  } finally {
    if (options?.signal) {
      options.signal.removeEventListener("abort", handleAbort);
    }

    if (sandbox && shouldCleanupSandbox) {
      try {
        await sandbox.kill();
      } catch {
        // Best-effort cleanup; the sandbox will also expire on its own.
      }
    }
  }
}
