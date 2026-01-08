import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const TOUCH_BREAKPOINT = 1024;

export function useIsMobile() {
	const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

	React.useEffect(() => {
		const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

		const checkMobile = () => {
			const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT;
			const isTouchSmallScreen = isTouchDevice && window.innerWidth < TOUCH_BREAKPOINT;
			setIsMobile(isSmallScreen || isTouchSmallScreen);
		};

		mql.addEventListener("change", checkMobile);
		checkMobile();
		return () => mql.removeEventListener("change", checkMobile);
	}, []);

	return !!isMobile;
}
