import { Box, Button, VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { css } from "@codemirror/lang-css";
import { autocompletion } from "@codemirror/autocomplete";
import { oneDark } from "@codemirror/theme-one-dark";
import { CSSLint } from "csslint";
import { usePostThemeSetting, useGetUpdatedUserThemeSetting } from "../services/api";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { publishStatusAtom } from "../Atoms/publishStatus";
import { levelModeAtom } from "../Atoms/levelMode";

const CustomCss = () => {
  const [value, setValue] = useState("example, \n" + "   body  {\n  color: red;\n}");
  const [consoleMessage, setConsoleMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const setPublishStatus = useSetRecoilState(publishStatusAtom);
  const level = useRecoilValue(levelModeAtom);

  const { mutate, isLoading } = usePostThemeSetting();
  const { data: draftData } = useGetUpdatedUserThemeSetting();
  // Track which locationId the editor was last hydrated for. A simple
  // one-shot boolean wouldn't refresh the editor when the user switches
  // the Level Switcher (each account has its own custom_css).
  const hydratedForLocationIdRef = useRef<string | null>(null);
  const currentLocationId =
    level.mode === "subaccount"
      ? level.subaccountId ?? "agency"
      : "agency";

  const onChange = useCallback((val: any) => {
    setValue(val);
    setConsoleMessage("");
  }, []);

  const handleSave = async () => {
    const result = CSSLint.verify(value);

    if (result.messages.length > 0) {
      const errors = result.messages
        .map(
          (msg: { line: any; message: any }) =>
            `Line ${msg.line || 0}: ${msg.message}`
        )
        .join("\n");
      setIsError(true);
      setConsoleMessage(`❌ CSS Errors:\n${errors}`);
      return;
    }

    try {
      const locationId =
        level.mode === "subaccount"
          ? level.subaccountId ?? "agency"
          : "agency";

      const payload: any = {
        section: "custom_css",
        type: "draft",
        locationId,
        custom_css: value,
      };

      await mutate(payload);

      localStorage.setItem("my-css", value);
      setPublishStatus("draft");

      setIsError(false);
      setConsoleMessage("✅ CSS saved as draft — click Publish to push live");
    } catch (error) {
      console.error("Failed to save custom CSS:", error);
      setIsError(true);
      setConsoleMessage("❌ Failed to save CSS to server");
    }
  };

  // Fast path: load the last locally-cached value immediately on mount so the
  // editor isn't blank while the network request is in flight.
  useEffect(() => {
    const saved = localStorage.getItem("my-css");
    if (saved) setValue(saved);
  }, []);

  // Authoritative path: once the saved draft arrives from the backend, override
  // with that value. Gated on locationId so that switching the Level Switcher
  // (each account has its own custom_css) re-hydrates the editor instead of
  // staying stuck on the previous account's value. Subsequent refetches
  // within the same location are no-ops, so an unsaved in-session edit
  // won't be snapped back if the query invalidates.
  useEffect(() => {
    if (hydratedForLocationIdRef.current === currentLocationId) return;
    if (!draftData) return;

    const draftCss = draftData?.themes?.draft?.[0]?.custom_css ?? "";
    setValue(draftCss);
    if (draftCss) localStorage.setItem("my-css", draftCss);
    hydratedForLocationIdRef.current = currentLocationId;
  }, [draftData, currentLocationId]);

  return (
    <Box width="100%" p={{ base: 2, md: 4 }}>
      <VStack align="stretch" gap={{ base: 3, md: 4 }}>
        <Box
          width="100%"
          borderRadius="md"
          overflow="hidden"
          boxShadow="md"
          border="1px solid #2d2d2d"
        >
          <CodeMirror
            value={value}
            height="300px"
            onChange={onChange}
            extensions={[css(), autocompletion()]}
            theme={oneDark}
            style={{ fontSize: "14px" }}
          />
        </Box>

        <Button
          colorScheme="blue"
          alignSelf={{ base: "stretch", sm: "flex-end" }}
          onClick={handleSave}
        >
          {isLoading ? "Loading..." : "Apply CSS"}
        </Button>

        {consoleMessage && (
          <Box
            bg="gray.900"
            color={isError ? "red.300" : "green.300"}
            fontFamily="monospace"
            fontSize="sm"
            p={3}
            borderRadius="md"
            whiteSpace="pre-wrap"
            border="1px solid"
            borderColor={isError ? "red.500" : "green.500"}
            overflowX="auto"
          >
            {consoleMessage}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default CustomCss;
