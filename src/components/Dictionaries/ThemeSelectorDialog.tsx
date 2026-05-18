// ThemeSelectorDialog.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
    Badge,
    Box,
    Button,
    Dialog,
    Flex,
    IconButton,
    Image,
    type ImageProps,
    Input,
    Portal,
    Skeleton,
    Stack,
    Text,
} from '@chakra-ui/react';
import { LuCheck, LuImageOff, LuLayoutGrid, LuSearch, LuSparkles } from 'react-icons/lu';
import { CloseButton } from '../ui/close-button';
import { useRecoilState, useRecoilValue } from 'recoil';
import { toast } from 'react-toastify';
import { selectedThemeFamily, type ThemeType } from '../Atoms/selectedThemeState';
import { levelModeAtom } from '../Atoms/levelMode';
import GetUserCustomTheme from '../utilities/getUserTheme';
import nexticon from '../../assets/next.svg';
import previcon from '../../assets/prev.svg';
import store from 'store2';

type Theme = {
    theme_uuid: string;
    title: string;
    image: string; // comma-separated URLs
};

// Reads whichever id field a theme actually has — the backend uses
// `theme_uuid` everywhere; some old code paths write `id`. Falls back to ""
// so a missing-id theme can never accidentally match another missing-id theme.
const getThemeId = (t: { theme_uuid?: string; id?: string } | null | undefined) =>
    t?.theme_uuid ?? t?.id ?? "";

interface ThemeSelectorDialogProps {
    themes: Theme[];
    label?: string;
    ThemeTitle: string;
    isLoading: boolean;
    apiError: string;
    // Scope for the selection: "dashboard" tab and "login" tab keep separate
    // selections. Each writes/reads its own slot in the selectedThemeFamily.
    themeType: ThemeType;
}

// Renders a real <Image> when src loads, swaps to a gradient placeholder
// (the brand purple gradient + image-off icon) when the URL is invalid or
// fails. Inherits all the layout/sizing props passed in so it works for both
// absolute-positioned card hero images and inline thumbnails.
const SafeImage: React.FC<ImageProps> = ({ src, alt, ...rest }) => {
    const [errored, setErrored] = useState(false);
    const hasSrc = typeof src === 'string' && src.trim().length > 0;

    if (!hasSrc || errored) {
        return (
            <Flex
                {...rest}
                bg="linear-gradient(135deg, #735DFF 0%, #a78bfa 50%, #c4b5fd 100%)"
                align="center"
                justify="center"
                color="whiteAlpha.800"
            >
                <LuImageOff size={24} />
            </Flex>
        );
    }

    return <Image src={src} alt={alt} onError={() => setErrored(true)} {...rest} />;
};

const ThemeSelectorDialog: React.FC<ThemeSelectorDialogProps> = ({
    themes = [],
    label = 'Select Theme',
    ThemeTitle = 'Select Theme',
    isLoading = false,
    apiError = '',
    themeType,
}) => {
    // Per-location selection: agency and each subaccount keep independent
    // theme picks, so switching the Level Switcher doesn't bleed one level's
    // selection into another's slot.
    const level = useRecoilValue(levelModeAtom);
    const currentLocationId =
        level.mode === "subaccount"
            ? level.subaccountId ?? "agency"
            : "agency";
    const [selectedTheme, setSelectedTheme] = useRecoilState(
        selectedThemeFamily({ themeType, locationId: currentLocationId })
    );
    const [isOpen, setIsOpen] = useState(false);
    const [fullscreenPreview, setFullscreenPreview] = useState<Theme | null>(null);
    const [activeImgIdx, setActiveImgIdx] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const sid = getThemeId(selectedTheme);
        if (sid) {
            const data = (store("changedList") as string[]) || [];
            if (!data.includes(sid)) {
                store("changedList", [...data, sid]);
            }
        }
    }, [selectedTheme]);

    const filteredThemes = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return themes;
        return themes.filter((t) => t.title.toLowerCase().includes(q));
    }, [themes, searchQuery]);

    // Skeleton count for the loading state. Order of preference:
    // 1) Live themes length (react-query cache during a refetch).
    // 2) Last-known count persisted from the previous successful load.
    // 3) Hard fallback of 6 (only on a brand-new install with no cache).
    const lastKnownCount = useMemo(() => {
        const stored = localStorage.getItem('themes-list-count');
        const n = stored ? parseInt(stored, 10) : NaN;
        return Number.isFinite(n) && n > 0 ? n : 6;
    }, []);
    const skeletonCount = themes.length > 0 ? themes.length : lastKnownCount;

    useEffect(() => {
        if (themes.length > 0) {
            localStorage.setItem('themes-list-count', String(themes.length));
        }
    }, [themes.length]);

    const handleApply = () => {
        if (!fullscreenPreview) return;
        const picked = fullscreenPreview;
        try {
            setSelectedTheme(picked);
            // Recoil's store2Effect persists under selectedTheme:<type>.
            // Close BOTH dialogs — preview AND the underlying library list.
            // Previously only the preview closed, leaving the user staring at
            // the library grid with their pick already made.
            setFullscreenPreview(null);
            setIsOpen(false);
            toast.success(
                `"${picked.title}" applied — click Apply Changes to save`
            );
        } catch (err) {
            console.error('Apply theme failed:', err);
            toast.error('Failed to apply theme. Please try again.');
        }
    };

    const triggerLabel = selectedTheme ? selectedTheme.title : label;
    const triggerImage = selectedTheme?.image?.split(',')[0] ?? '';

    return (
        <>
            <Dialog.Root
                size="cover"
                placement="center"
                motionPreset="slide-in-bottom"
                open={isOpen}
                onOpenChange={(d) => setIsOpen(d.open)}
            >
                <GetUserCustomTheme theme={selectedTheme} />
                <Dialog.Trigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        px={3}
                        py={5}
                        onClick={() => setIsOpen(true)}
                    >
                        {!selectedTheme ? (
                            triggerLabel
                        ) : (
                            <Flex align="center" gap={2}>
                                <Box position="relative" boxSize="30px" rounded="md" overflow="hidden" bg="gray.100">
                                    <SafeImage
                                        src={triggerImage}
                                        alt={selectedTheme.title}
                                        boxSize="30px"
                                        rounded="md"
                                        objectFit="cover"
                                    />
                                </Box>
                                <Text fontSize="sm" truncate maxW="160px">
                                    {selectedTheme.title}
                                </Text>
                            </Flex>
                        )}
                    </Button>
                </Dialog.Trigger>

                <Portal>
                    <Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content
                            w={{ base: '95vw', md: '92vw' }}
                            maxW="1200px"
                            maxH="92vh"
                            overflow="hidden"
                            display="flex"
                            flexDirection="column"
                            borderRadius="xl"
                            boxShadow="2xl"
                            bgColor="#f5f3ff"
                            bgImage="radial-gradient(circle at 15% 5%, rgba(115, 93, 255, 0.22), transparent 55%), radial-gradient(circle at 85% 100%, rgba(115, 93, 255, 0.14), transparent 55%)"
                        >
                            {/* HEADER */}
                            <Dialog.Header
                                bg="rgba(255, 255, 255, 0.7)"
                                backdropFilter="blur(10px)"
                                borderBottom="1px solid"
                                borderColor="rgba(115, 93, 255, 0.12)"
                                px={{ base: 4, md: 7 }}
                                py={4}
                                flexShrink={0}
                            >
                                <Flex justify="space-between" align="center" w="100%" gap={3}>
                                    <Flex align="center" gap={3} minW={0}>
                                        <Flex
                                            align="center"
                                            justify="center"
                                            boxSize="40px"
                                            borderRadius="lg"
                                            bg="linear-gradient(135deg, #735DFF 0%, #a78bfa 100%)"
                                            color="white"
                                            flexShrink={0}
                                        >
                                            <LuSparkles size={20} />
                                        </Flex>
                                        <Stack gap={0} minW={0}>
                                            <Text
                                                fontSize="xs"
                                                color="gray.500"
                                                textTransform="uppercase"
                                                letterSpacing="wider"
                                                fontWeight="semibold"
                                            >
                                                Theme Library
                                            </Text>
                                            <Dialog.Title
                                                fontSize={{ base: 'md', md: 'lg' }}
                                                fontWeight="bold"
                                                color="gray.900"
                                            >
                                                {ThemeTitle}
                                            </Dialog.Title>
                                        </Stack>
                                    </Flex>
                                    <Flex align="center" gap={2} flexShrink={0}>
                                        {!isLoading && !apiError && themes.length > 0 && (
                                            <Badge
                                                bg="white"
                                                color="gray.700"
                                                fontSize="xs"
                                                fontWeight="medium"
                                                px={2.5}
                                                py={1}
                                                borderRadius="full"
                                                display={{ base: 'none', sm: 'inline-flex' }}
                                                border="1px solid"
                                                borderColor="rgba(115, 93, 255, 0.2)"
                                            >
                                                {filteredThemes.length}{' '}
                                                {filteredThemes.length === 1 ? 'theme' : 'themes'}
                                            </Badge>
                                        )}
                                        <Dialog.CloseTrigger>
                                            <CloseButton size="sm" />
                                        </Dialog.CloseTrigger>
                                    </Flex>
                                </Flex>
                            </Dialog.Header>

                            <Dialog.Body p={0} flex="1" overflow="auto">
                                {/* SEARCH BAR */}
                                {!isLoading && !apiError && themes.length > 0 && (
                                    <Box
                                        position="sticky"
                                        top={0}
                                        bg="rgba(245, 243, 255, 0.85)"
                                        backdropFilter="blur(10px)"
                                        zIndex={1}
                                        px={{ base: 4, md: 7 }}
                                        py={4}
                                        borderBottom="1px solid"
                                        borderColor="rgba(115, 93, 255, 0.12)"
                                    >
                                        <Box position="relative" maxW="520px">
                                            <Box
                                                position="absolute"
                                                left={3.5}
                                                top="50%"
                                                transform="translateY(-50%)"
                                                color="gray.400"
                                                pointerEvents="none"
                                                zIndex={1}
                                            >
                                                <LuSearch size={16} />
                                            </Box>
                                            <Input
                                                placeholder="Search themes by name…"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                pl={10}
                                                h="40px"
                                                bg="white"
                                                borderColor="rgba(115, 93, 255, 0.18)"
                                                fontSize="sm"
                                                borderRadius="lg"
                                                _hover={{ borderColor: 'rgba(115, 93, 255, 0.35)' }}
                                                _focus={{
                                                    borderColor: '#735DFF',
                                                    boxShadow: '0 0 0 3px rgba(115, 93, 255, 0.18)',
                                                }}
                                                transition="all 0.15s"
                                            />
                                        </Box>
                                    </Box>
                                )}

                                {/* GRID */}
                                <Box px={{ base: 4, md: 7 }} py={5}>
                                    {isLoading ? (
                                        <Box
                                            display="grid"
                                            gridTemplateColumns={{
                                                base: 'repeat(auto-fill, minmax(160px, 1fr))',
                                                sm: 'repeat(auto-fill, minmax(200px, 1fr))',
                                                md: 'repeat(auto-fill, minmax(240px, 1fr))',
                                            }}
                                            gap={5}
                                        >
                                            {Array.from({ length: skeletonCount }).map((_, i) => (
                                                <Box
                                                    key={i}
                                                    bg="white"
                                                    rounded="xl"
                                                    overflow="hidden"
                                                    border="1px solid"
                                                    borderColor="rgba(115, 93, 255, 0.1)"
                                                    boxShadow="0 1px 3px rgba(15, 23, 42, 0.04)"
                                                >
                                                    <Skeleton h={{ base: '110px', md: '140px' }} />
                                                    <Box p={3}>
                                                        <Skeleton h="14px" rounded="sm" />
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : apiError ? (
                                        <Stack align="center" py={20} gap={2}>
                                            <Text color="red.500" fontWeight="medium">
                                                Something went wrong
                                            </Text>
                                            <Text color="gray.500" fontSize="sm">
                                                {apiError}
                                            </Text>
                                        </Stack>
                                    ) : filteredThemes.length === 0 ? (
                                        <Stack align="center" py={20} gap={3}>
                                            <Flex
                                                align="center"
                                                justify="center"
                                                boxSize="64px"
                                                borderRadius="full"
                                                bg="white"
                                                border="1px solid"
                                                borderColor="rgba(115, 93, 255, 0.2)"
                                                color="#735DFF"
                                            >
                                                <LuLayoutGrid size={28} />
                                            </Flex>
                                            <Stack gap={0.5} align="center">
                                                <Text color="gray.800" fontWeight="semibold">
                                                    {searchQuery ? 'No matches found' : 'No themes yet'}
                                                </Text>
                                                <Text color="gray.500" fontSize="sm">
                                                    {searchQuery
                                                        ? `Nothing matches "${searchQuery}"`
                                                        : 'Themes will appear here once available'}
                                                </Text>
                                            </Stack>
                                        </Stack>
                                    ) : (
                                        <Box
                                            display="grid"
                                            gridTemplateColumns={{
                                                base: 'repeat(auto-fill, minmax(160px, 1fr))',
                                                sm: 'repeat(auto-fill, minmax(200px, 1fr))',
                                                md: 'repeat(auto-fill, minmax(240px, 1fr))',
                                            }}
                                            gap={5}
                                        >
                                            {filteredThemes.map((theme) => {
                                                const themeId = getThemeId(theme);
                                                const selectedId = getThemeId(selectedTheme);
                                                const isSelected =
                                                    !!themeId && themeId === selectedId;
                                                const firstImg = theme.image?.split(',')[0] ?? '';
                                                return (
                                                    <Box
                                                        key={themeId}
                                                        role="group"
                                                        onClick={() => {
                                                            setFullscreenPreview(theme);
                                                            setActiveImgIdx(0);
                                                        }}
                                                        cursor="pointer"
                                                        bg="white"
                                                        rounded="xl"
                                                        overflow="hidden"
                                                        border="1px solid"
                                                        borderColor={
                                                            isSelected ? '#735DFF' : 'gray.100'
                                                        }
                                                        boxShadow={
                                                            isSelected
                                                                ? '0 0 0 3px rgba(115, 93, 255, 0.18), 0 8px 20px rgba(115, 93, 255, 0.15)'
                                                                : '0 1px 3px rgba(15, 23, 42, 0.06)'
                                                        }
                                                        transition="transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s ease"
                                                        _hover={{
                                                            transform: 'translateY(-3px)',
                                                            boxShadow: isSelected
                                                                ? '0 0 0 3px rgba(115, 93, 255, 0.25), 0 14px 28px rgba(115, 93, 255, 0.22)'
                                                                : '0 12px 24px rgba(15, 23, 42, 0.10)',
                                                            borderColor: isSelected
                                                                ? '#735DFF'
                                                                : 'gray.200',
                                                        }}
                                                    >
                                                        {/* Image with overlay */}
                                                        <Box
                                                            position="relative"
                                                            bg="gray.100"
                                                            pb="62%"
                                                            overflow="hidden"
                                                        >
                                                            <SafeImage
                                                                src={firstImg}
                                                                alt={theme.title}
                                                                position="absolute"
                                                                inset="0"
                                                                w="100%"
                                                                h="100%"
                                                                objectFit="cover"
                                                                transition="transform 0.4s ease"
                                                                _groupHover={{
                                                                    transform: 'scale(1.05)',
                                                                }}
                                                            />
                                                            {/* Bottom gradient — appears on hover */}
                                                            <Box
                                                                position="absolute"
                                                                inset={0}
                                                                bg="linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 50%)"
                                                                opacity={0}
                                                                _groupHover={{ opacity: 1 }}
                                                                transition="opacity 0.25s ease"
                                                                pointerEvents="none"
                                                            />
                                                            {/* Preview hint on hover */}
                                                            <Flex
                                                                position="absolute"
                                                                bottom={2}
                                                                left={2}
                                                                right={2}
                                                                opacity={0}
                                                                _groupHover={{ opacity: 1 }}
                                                                transition="opacity 0.25s ease"
                                                                pointerEvents="none"
                                                                justify="space-between"
                                                                align="center"
                                                            >
                                                                <Text
                                                                    color="white"
                                                                    fontSize="xs"
                                                                    fontWeight="semibold"
                                                                    textShadow="0 1px 2px rgba(0,0,0,0.4)"
                                                                >
                                                                    Preview →
                                                                </Text>
                                                            </Flex>
                                                            {/* Active checkmark */}
                                                            {isSelected && (
                                                                <Flex
                                                                    position="absolute"
                                                                    top={2}
                                                                    right={2}
                                                                    bg="#735DFF"
                                                                    color="white"
                                                                    borderRadius="full"
                                                                    boxSize="28px"
                                                                    align="center"
                                                                    justify="center"
                                                                    boxShadow="0 4px 8px rgba(115, 93, 255, 0.4)"
                                                                >
                                                                    <LuCheck size={16} />
                                                                </Flex>
                                                            )}
                                                        </Box>

                                                        {/* Info row */}
                                                        <Flex
                                                            justify="space-between"
                                                            align="center"
                                                            px={3.5}
                                                            py={3}
                                                            gap={2}
                                                        >
                                                            <Stack gap={0.5} minW={0} flex={1}>
                                                                <Text
                                                                    fontWeight="semibold"
                                                                    fontSize="sm"
                                                                    truncate
                                                                    color="gray.900"
                                                                    lineHeight="1.2"
                                                                >
                                                                    {theme.title}
                                                                </Text>
                                                                <Text
                                                                    fontSize="xs"
                                                                    color={
                                                                        isSelected
                                                                            ? '#735DFF'
                                                                            : 'gray.500'
                                                                    }
                                                                    fontWeight={
                                                                        isSelected ? 'semibold' : 'normal'
                                                                    }
                                                                    lineHeight="1.2"
                                                                >
                                                                    {isSelected
                                                                        ? 'Active theme'
                                                                        : 'Click to preview'}
                                                                </Text>
                                                            </Stack>
                                                        </Flex>
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    )}
                                </Box>
                            </Dialog.Body>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* PREVIEW MODAL */}
            <Dialog.Root
                open={!!fullscreenPreview}
                onOpenChange={(d) => !d.open && setFullscreenPreview(null)}
            >
                <Portal>
                    <Dialog.Backdrop bg="blackAlpha.800" backdropFilter="blur(6px)" />
                    <Dialog.Positioner>
                        <Dialog.Content
                            w={{ base: '95vw', md: '88vw' }}
                            maxW="1100px"
                            h={{ base: '95vh', md: '88vh' }}
                            p={0}
                            bg="white"
                            overflow="hidden"
                            borderRadius="xl"
                            boxShadow="2xl"
                        >
                            <Dialog.Body p={0} h="full">
                                {fullscreenPreview && (
                                    <Flex direction="column" h="full">
                                        {/* Header */}
                                        <Flex
                                            justify="space-between"
                                            align="center"
                                            px={{ base: 4, md: 6 }}
                                            py={4}
                                            borderBottom="1px solid"
                                            borderColor="gray.100"
                                            bg="white"
                                            flexShrink={0}
                                        >
                                            <Flex align="center" gap={3} minW={0}>
                                                <Flex
                                                    align="center"
                                                    justify="center"
                                                    boxSize="36px"
                                                    borderRadius="lg"
                                                    bg="linear-gradient(135deg, #735DFF 0%, #a78bfa 100%)"
                                                    color="white"
                                                    flexShrink={0}
                                                >
                                                    <LuSparkles size={16} />
                                                </Flex>
                                                <Stack gap={0} minW={0}>
                                                    <Text
                                                        fontSize="xs"
                                                        color="gray.500"
                                                        textTransform="uppercase"
                                                        letterSpacing="wider"
                                                        fontWeight="semibold"
                                                    >
                                                        Preview
                                                    </Text>
                                                    <Text
                                                        fontWeight="bold"
                                                        fontSize={{ base: 'md', md: 'lg' }}
                                                        truncate
                                                        color="gray.900"
                                                    >
                                                        {fullscreenPreview.title}
                                                    </Text>
                                                </Stack>
                                            </Flex>
                                            <Dialog.CloseTrigger>
                                                <CloseButton />
                                            </Dialog.CloseTrigger>
                                        </Flex>

                                        {/* Main image area */}
                                        <Box
                                            flex="1"
                                            position="relative"
                                            bg="gray.50"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            p={{ base: 3, md: 6 }}
                                            overflow="hidden"
                                        >
                                            <Box
                                                position="relative"
                                                maxH="100%"
                                                maxW="100%"
                                                borderRadius="lg"
                                                overflow="hidden"
                                                boxShadow="0 12px 32px rgba(0,0,0,0.12)"
                                            >
                                                <SafeImage
                                                    src={
                                                        fullscreenPreview.image.split(',')[
                                                            activeImgIdx
                                                        ]
                                                    }
                                                    alt={`Preview ${activeImgIdx + 1}`}
                                                    maxH={{ base: '50vh', md: '65vh' }}
                                                    maxW="100%"
                                                    objectFit="contain"
                                                    w={{ base: '300px', md: '600px' }}
                                                    h={{ base: '200px', md: '400px' }}
                                                />
                                            </Box>
                                            {fullscreenPreview.image.split(',').length > 1 && (
                                                <>
                                                    <IconButton
                                                        aria-label="Previous"
                                                        position="absolute"
                                                        left={{ base: 2, md: 4 }}
                                                        top="50%"
                                                        transform="translateY(-50%)"
                                                        bg="white"
                                                        color="gray.700"
                                                        boxShadow="0 4px 12px rgba(0,0,0,0.12)"
                                                        size="md"
                                                        borderRadius="full"
                                                        _hover={{
                                                            bg: 'white',
                                                            transform:
                                                                'translateY(-50%) scale(1.05)',
                                                            boxShadow:
                                                                '0 6px 16px rgba(0,0,0,0.16)',
                                                        }}
                                                        transition="all 0.2s"
                                                        onClick={() =>
                                                            setActiveImgIdx(
                                                                (i) =>
                                                                    (i -
                                                                        1 +
                                                                        fullscreenPreview.image.split(
                                                                            ','
                                                                        ).length) %
                                                                    fullscreenPreview.image.split(
                                                                        ','
                                                                    ).length
                                                            )
                                                        }
                                                    >
                                                        <Image
                                                            src={previcon}
                                                            alt="prev"
                                                            boxSize={4}
                                                        />
                                                    </IconButton>
                                                    <IconButton
                                                        aria-label="Next"
                                                        position="absolute"
                                                        right={{ base: 2, md: 4 }}
                                                        top="50%"
                                                        transform="translateY(-50%)"
                                                        bg="white"
                                                        color="gray.700"
                                                        boxShadow="0 4px 12px rgba(0,0,0,0.12)"
                                                        size="md"
                                                        borderRadius="full"
                                                        _hover={{
                                                            bg: 'white',
                                                            transform:
                                                                'translateY(-50%) scale(1.05)',
                                                            boxShadow:
                                                                '0 6px 16px rgba(0,0,0,0.16)',
                                                        }}
                                                        transition="all 0.2s"
                                                        onClick={() =>
                                                            setActiveImgIdx(
                                                                (i) =>
                                                                    (i + 1) %
                                                                    fullscreenPreview.image.split(
                                                                        ','
                                                                    ).length
                                                            )
                                                        }
                                                    >
                                                        <Image
                                                            src={nexticon}
                                                            alt="next"
                                                            boxSize={4}
                                                        />
                                                    </IconButton>
                                                </>
                                            )}
                                        </Box>

                                        {/* Footer: thumbnails + apply button */}
                                        <Flex
                                            direction={{ base: 'column', md: 'row' }}
                                            gap={3}
                                            align={{ base: 'stretch', md: 'center' }}
                                            justify="space-between"
                                            px={{ base: 4, md: 6 }}
                                            py={4}
                                            borderTop="1px solid"
                                            borderColor="gray.100"
                                            bg="white"
                                            flexShrink={0}
                                        >
                                            <Flex
                                                overflowX="auto"
                                                gap={2}
                                                flex={1}
                                                minW={0}
                                                py={1}
                                                css={{
                                                    '&::-webkit-scrollbar': { height: '4px' },
                                                    '&::-webkit-scrollbar-thumb': {
                                                        background: 'rgba(0,0,0,0.2)',
                                                        borderRadius: '2px',
                                                    },
                                                }}
                                            >
                                                {fullscreenPreview.image
                                                    .split(',')
                                                    .map((src, i) => {
                                                        const active = i === activeImgIdx;
                                                        return (
                                                            <Box
                                                                key={i}
                                                                position="relative"
                                                                boxSize="56px"
                                                                rounded="md"
                                                                overflow="hidden"
                                                                cursor="pointer"
                                                                onClick={() => setActiveImgIdx(i)}
                                                                border="2px solid"
                                                                borderColor={
                                                                    active
                                                                        ? '#735DFF'
                                                                        : 'gray.200'
                                                                }
                                                                opacity={active ? 1 : 0.65}
                                                                transition="all 0.2s"
                                                                _hover={{
                                                                    opacity: 1,
                                                                    borderColor: active
                                                                        ? '#735DFF'
                                                                        : 'gray.400',
                                                                }}
                                                                flexShrink={0}
                                                                bg="gray.100"
                                                            >
                                                                <SafeImage
                                                                    src={src}
                                                                    boxSize="100%"
                                                                    objectFit="cover"
                                                                />
                                                            </Box>
                                                        );
                                                    })}
                                            </Flex>
                                            <Button
                                                bg="linear-gradient(135deg, #735DFF 0%, #5b48d9 100%)"
                                                color="white"
                                                _hover={{
                                                    bg: 'linear-gradient(135deg, #5b48d9 0%, #4a3bb8 100%)',
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 8px 20px rgba(115, 93, 255, 0.35)',
                                                }}
                                                _active={{
                                                    transform: 'translateY(0)',
                                                }}
                                                size="md"
                                                px={6}
                                                fontWeight="semibold"
                                                borderRadius="lg"
                                                boxShadow="0 4px 12px rgba(115, 93, 255, 0.25)"
                                                transition="all 0.2s"
                                                flexShrink={0}
                                                onClick={handleApply}
                                            >
                                                <LuCheck size={16} />
                                                Apply Theme
                                            </Button>
                                        </Flex>
                                    </Flex>
                                )}
                            </Dialog.Body>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
};

export default ThemeSelectorDialog;
