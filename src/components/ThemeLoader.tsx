import { useEffect } from "react";
import { useGetUpdatedUserThemeSetting } from "./services/api";
import { applyThemeRoots } from "./utilities/applyThemeRoots";

const ThemeLoader = () => {
    const { data, isLoading, isSuccess } = useGetUpdatedUserThemeSetting();

    useEffect(() => {
        if (isSuccess && data?.themes?.draft && data.themes.draft.length > 0) {
            const roots = data.themes.draft[0].theme_roots;
            if (roots && !Array.isArray(roots)) {
                applyThemeRoots(roots as Record<string, string>);
            }
        }
    }, [data, isSuccess]);

    return null; // this component just runs logic
};

export default ThemeLoader;
