import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { css } from "@codemirror/lang-css";
import { autocompletion } from "@codemirror/autocomplete";
import { oneDark } from "@codemirror/theme-one-dark";
import { CSSLint } from "csslint";
import { FaCode } from "react-icons/fa6";
import { LuCircleCheck, LuTriangleAlert } from "react-icons/lu";
import { usePostThemeSetting, useGetUpdatedUserThemeSetting } from "../services/api";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { publishStatusAtom } from "../Atoms/publishStatus";
import { levelModeAtom } from "../Atoms/levelMode";
import { Button } from "../ui/button";
import PageHeader from "../Molecules/PageHeader";

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
      setConsoleMessage(`Please fix the following before saving:\n${errors}`);
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
      setConsoleMessage(
        "Saved as a draft. Click Publish in the top bar to push it live."
      );
    } catch (error) {
      console.error("Failed to save custom CSS:", error);
      setIsError(true);
      setConsoleMessage(
        "We couldn't save your CSS. Please check your connection and try again."
      );
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
    <>
      <PageHeader
        icon={<FaCode size={20} />}
        title="Custom CSS"
        description="Add your own CSS to fine-tune anything the theme controls don't cover. Applied on top of your theme and saved as a draft until you publish."
      />

      <Box mx={{ base: 2, md: 6 }}>
        <Box
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="xl"
          shadow="sm"
          overflow="hidden"
        >
          {/* Toolbar */}
          <Flex
            align="center"
            justify="space-between"
            gap={3}
            px={{ base: 3, md: 4 }}
            py={3}
            borderBottom="1px solid"
            borderColor="gray.100"
            direction={{ base: "column", sm: "row" }}
          >
            <Stack gap={0.5} minW={0} w={{ base: "100%", sm: "auto" }}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                Stylesheet editor
              </Text>
              <Text fontSize="xs" color="gray.500">
                Your CSS is validated automatically before it's saved.
              </Text>
            </Stack>
            <Button
              onClick={handleSave}
              colorPalette="brand"
              size="sm"
              borderRadius="lg"
              fontWeight="semibold"
              loading={isLoading}
              loadingText="Saving…"
              w={{ base: "100%", sm: "auto" }}
            >
              Save CSS
            </Button>
          </Flex>

          {/* Editor */}
          <CodeMirror
            value={value}
            height="360px"
            onChange={onChange}
            extensions={[css(), autocompletion()]}
            theme={oneDark}
            style={{ fontSize: "14px" }}
          />
        </Box>

        {/* Validation / save result */}
        {consoleMessage && (
          <Flex
            mt={3}
            gap={2.5}
            p={3.5}
            borderRadius="lg"
            border="1px solid"
            bg={isError ? "red.50" : "green.50"}
            borderColor={isError ? "red.200" : "green.200"}
            align="flex-start"
          >
            <Box
              color={isError ? "red.500" : "green.600"}
              flexShrink={0}
              mt="1px"
            >
              {isError ? (
                <LuTriangleAlert size={18} />
              ) : (
                <LuCircleCheck size={18} />
              )}
            </Box>
            <Text
              fontSize="sm"
              color={isError ? "red.700" : "green.700"}
              whiteSpace="pre-wrap"
              lineHeight="1.6"
            >
              {consoleMessage}
            </Text>
          </Flex>
        )}
      </Box>
    </>
  );
};

export default CustomCss;
