import React from "react";

export default function Footer() {
	return (
		<div className="h-10 flex flex-row items-center justify-between p-2 bg-special-hfu-green sm:p-4">
			<div className="text-sm text-custom-white-primary">
				© {new Date().getFullYear()}{" "}
				<span>Luis Staudt</span>
			</div>
		</div>
	);
}
