import React, { useState, useEffect, useRef, useCallback } from "react";
import Ajv from "ajv";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  ButtonGroup,
  Card,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faAlignLeft,
  faCompressAlt,
  faUndo,
  faRedo,
} from "@fortawesome/free-solid-svg-icons";
import {
  saveJson,
  getSavedJsonList,
  loadJsonById,
  SavedJson,
} from "./utils/localStorageUtils";
import MainBrandLogo from "./components/MainBrandLogo";

const App: React.FC = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [saves, setSaves] = useState<SavedJson[]>([]);
  const [jsonInputB, setJsonInputB] = useState("");
  const [jsonSchema, setJsonSchema] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );
  const urlInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFromURL = useCallback(async () => {
    const url = urlInputRef.current?.value?.trim();
    if (!url) return;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const jsonStr = JSON.stringify(data, null, 2);
      setJsonInput(jsonStr);
      setError(null);
    } catch (err: any) {
      setError(`❌ Failed to fetch JSON from URL: ${err.message}`);
    }
  }, []);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          const jsonStr = JSON.stringify(parsed, null, 2);
          setJsonInput(jsonStr);
          setError(null);
        } catch (err: any) {
          setError(`❌ Failed to read JSON file: ${err.message}`);
        }
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.readAsText(file);
    },
    []
  );

  useEffect(() => {
    setSaves(getSavedJsonList());
  }, []);

  // Save previous input before changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (jsonInput && history[history.length - 1] !== jsonInput) {
        setHistory((prev) => [...prev, jsonInput]);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [jsonInput, history]);

  const handleUndo = () => {
    if (history.length === 0) return;

    const prev = history[history.length - 1];
    setRedoStack((r) => [jsonInput, ...r]);
    setHistory((h) => h.slice(0, -1));
    setJsonInput(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const next = redoStack[0];
    setRedoStack((r) => r.slice(1));
    setHistory((h) => [...h, jsonInput]);
    setJsonInput(next);
  };

  const handleViewJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const pretty = JSON.stringify(parsed, null, 2);
      setJsonOutput(pretty);
      setError(null);
    } catch (e) {
      setError("❌ Invalid JSON");
      setJsonOutput(null);
    }
  };

  const handlePrettyPrint = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const pretty = JSON.stringify(parsed, null, 2);
      setJsonInput(pretty);
      setError(null);
    } catch (e) {
      setError("❌ Invalid JSON");
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsed);
      setJsonInput(minified);
      setError(null);
    } catch (e) {
      setError("❌ Invalid JSON");
    }
  };

  const handleMergeJson = () => {
    try {
      const a = JSON.parse(jsonInput);
      const b = JSON.parse(jsonInputB);
      const merged = { ...a, ...b }; // shallow merge
      const result = JSON.stringify(merged, null, 2);
      setJsonInput(result);
      setJsonInputB("");
      setError(null);
    } catch (e: any) {
      setError("❌ Failed to merge. One of the JSONs is invalid.");
    }
  };

  const handleValidateSchema = () => {
    try {
      const schema = JSON.parse(jsonSchema);
      const data = JSON.parse(jsonInput);
      const ajv = new Ajv({ allErrors: true });
      const validate = ajv.compile(schema);
      const valid = validate(data);
      if (valid) {
        setValidationMessage("✅ JSON is valid against the schema!");
      } else {
        const errors = validate.errors
          ?.map((err) => `🔸 ${err.instancePath} ${err.message}`)
          .join("\n");
        setValidationMessage(`❌ Validation errors:\n${errors}`);
      }
    } catch (err: any) {
      setValidationMessage("❌ Invalid JSON or Schema");
    }
  };

  const handleExportJson = () => {
    if (!jsonInput) return;

    try {
      const parsed = JSON.parse(jsonInput); // ensure valid
      const blob = new Blob([JSON.stringify(parsed, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "exported.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("❌ Invalid JSON — cannot export.");
    }
  };

  return (
    <>
      <MainBrandLogo
        logoSrc="/soft-logo.webp"
        mainDomain="soft.io.vn"
        dismissible={false}
        altText="Logo Soft"
      />
      <Container className="py-4">
        <h1 className="mb-4 text-center">🧰 JSON Tool</h1>
        <Row>
          <Col md={6}>
            <Form.Group controlId="jsonInput">
              <Form.Label>
                <strong>JSON Input</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={15}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your JSON here..."
              />
            </Form.Group>

            <ButtonGroup className="mt-3 flex-wrap gap-2">
              <Button variant="primary" onClick={handleViewJson}>
                <FontAwesomeIcon icon={faEye} className="me-2" />
                View
              </Button>
              <Button variant="success" onClick={handlePrettyPrint}>
                <FontAwesomeIcon icon={faAlignLeft} className="me-2" />
                Pretty Print
              </Button>
              <Button variant="warning" onClick={handleMinify}>
                <FontAwesomeIcon icon={faCompressAlt} className="me-2" />
                Minify
              </Button>
              <Button
                variant="secondary"
                onClick={handleUndo}
                disabled={history.length === 0}
              >
                <FontAwesomeIcon icon={faUndo} className="me-2" />
                Undo
              </Button>
              <Button
                variant="secondary"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
              >
                <FontAwesomeIcon icon={faRedo} className="me-2" />
                Redo
              </Button>
              <Button variant="outline-secondary" onClick={handleExportJson}>
                Export to .json
              </Button>
            </ButtonGroup>
            <Form className="mt-4">
              <Form.Label>
                <strong>🧪 JSON Schema Validator</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={jsonSchema}
                onChange={(e) => setJsonSchema(e.target.value)}
                placeholder="Paste your JSON Schema here..."
              />
              <Button
                className="mt-2"
                variant="outline-danger"
                onClick={handleValidateSchema}
              >
                Validate
              </Button>
              {validationMessage && (
                <div className="mt-2" style={{ whiteSpace: "pre-wrap" }}>
                  {validationMessage}
                </div>
              )}
            </Form>
            <Form className="mt-4">
              <Form.Label>
                <strong>🔀 Merge Another JSON</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={jsonInputB}
                onChange={(e) => setJsonInputB(e.target.value)}
                placeholder="Paste another JSON to merge into the main one..."
              />
              <Button className="mt-2" variant="dark" onClick={handleMergeJson}>
                Merge into Main JSON
              </Button>
            </Form>
            <Form className="mt-4">
              <Form.Label>
                <strong>💾 Save / Load JSON</strong>
              </Form.Label>
              <Row className="g-2 align-items-center">
                <Col xs={8}>
                  <Form.Control
                    type="text"
                    placeholder="Name this save..."
                    id="saveName"
                  />
                </Col>
                <Col xs={4}>
                  <Button
                    variant="outline-success"
                    onClick={() => {
                      const nameInput = document.getElementById(
                        "saveName"
                      ) as HTMLInputElement;
                      const name = nameInput.value.trim() || "Untitled";
                      if (jsonInput) {
                        saveJson(name, jsonInput);
                        setSaves(getSavedJsonList());
                        nameInput.value = "";
                      }
                    }}
                  >
                    Save
                  </Button>
                </Col>
              </Row>

              <Form.Select
                className="mt-3"
                onChange={(e) => {
                  const id = e.target.value;
                  if (id) {
                    const content = loadJsonById(id);
                    if (content) {
                      setJsonInput(content);
                      setError(null);
                    }
                  }
                }}
              >
                <option value="">📂 Load saved JSON...</option>
                {saves.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({new Date(item.timestamp).toLocaleString()})
                  </option>
                ))}
              </Form.Select>
            </Form>
            <Form className="mt-4">
              <Form.Label>
                <strong>📂 Upload JSON File</strong>
              </Form.Label>
              <Row className="g-2 align-items-center">
                <Col xs={8}>
                  <Form.Control
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleFileUpload}
                  />
                </Col>
                <Col xs={4}>
                  <Button
                    variant="outline-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload
                  </Button>
                </Col>
              </Row>
            </Form>
            <Form className="mt-4">
              <Form.Label>
                <strong>🌐 Import JSON from URL</strong>
              </Form.Label>
              <Row className="g-2 align-items-center">
                <Col xs={8}>
                  <Form.Control
                    type="text"
                    ref={urlInputRef}
                    placeholder="Enter JSON URL (e.g. https://api.example.com/data)"
                  />
                </Col>
                <Col xs={4}>
                  <Button
                    variant="outline-primary"
                    onClick={handleImportFromURL}
                  >
                    Import
                  </Button>
                </Col>
              </Row>
            </Form>
            {error && <div className="mt-2 text-danger">{error}</div>}
          </Col>

          <Col md={6}>
            <Form.Label>
              <strong>Output</strong>
            </Form.Label>
            <Card className="p-3 bg-light" style={{ minHeight: "360px" }}>
              {jsonOutput && (
                <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                  {jsonOutput}
                </pre>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default App;
