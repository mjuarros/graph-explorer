// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";

const mockDefineTheme = vi.fn();
const mockMonaco = { editor: { defineTheme: mockDefineTheme } };
const mockLoaderInit = vi.fn(() => Promise.resolve(mockMonaco));
const mockEditor = vi.fn(
  ({
    beforeMount,
    theme,
  }: {
    beforeMount?: (monaco: typeof mockMonaco) => void;
    theme?: string;
  }) => {
    beforeMount?.(mockMonaco);
    return (
      <div data-testid="monaco-editor" data-theme={theme}>
        Mock Editor
      </div>
    );
  },
);

beforeEach(() => {
  vi.resetModules();
  vi.doMock("@monaco-editor/react", () => ({
    Editor: mockEditor,
    loader: { init: mockLoaderInit },
  }));
});

describe("CodeEditor", () => {
  test("should not load Monaco when the module is imported", async () => {
    await import("./CodeEditor");

    expect(mockLoaderInit).not.toHaveBeenCalled();
  });

  test("should define the theme before invoking the caller beforeMount", async () => {
    const callerBeforeMount = vi.fn();
    const { CodeEditor } = await import("./CodeEditor");

    render(<CodeEditor beforeMount={callerBeforeMount} />);

    expect(mockDefineTheme).toHaveBeenCalledWith(
      "graph-explorer-light",
      expect.any(Object),
    );
    expect(callerBeforeMount).toHaveBeenCalledWith(mockMonaco);
    expect(mockDefineTheme).toHaveBeenCalledBefore(callerBeforeMount);
  });

  test("should render with graph-explorer-light theme", async () => {
    const { CodeEditor } = await import("./CodeEditor");

    render(<CodeEditor defaultLanguage="json" value="{}" />);

    const editor = screen.getByTestId("monaco-editor");
    expect(editor).toHaveAttribute("data-theme", "graph-explorer-light");
  });

  test("should render CodeEditor component", async () => {
    const { CodeEditor } = await import("./CodeEditor");

    render(<CodeEditor defaultLanguage="json" value="test content" />);

    const editor = screen.getByTestId("monaco-editor");
    expect(editor).toBeInTheDocument();
  });
});
