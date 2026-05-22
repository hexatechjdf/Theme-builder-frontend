/*
 * Tiny module-level bus that lets the navbar's Publish button trigger the
 * currently-mounted page's save (Apply Changes) flow before publishing.
 *
 * Only ONE workspace page is mounted at a time (Dashboard / LoginTheme /
 * LoaderAnimation each mount their own UseAllValues, which renders the save
 * mutation + LinkPropagationDialog). That page registers its saver here on
 * mount and clears it on unmount, so a single slot is sufficient — no need
 * to pipe section/sections through Recoil or props.
 *
 * The saver resolves to `true` on a successful save (or a clean no-op when
 * there is nothing to save), and `false` when the save fails or the user
 * cancels the link-propagation dialog. PublishMenu aborts publish on `false`.
 */

export type Saver = () => Promise<boolean>;

let currentSaver: Saver | null = null;

export const registerSaver = (saver: Saver | null): void => {
	currentSaver = saver;
};

export const runActiveSave = async (): Promise<boolean> => {
	if (!currentSaver) return true; // nothing registered = nothing to save
	return currentSaver();
};
