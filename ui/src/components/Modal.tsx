import { X } from "lucide-react";
import type React from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
			<div className="relative w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_#000]">
				<div className="flex items-center justify-between border-b-2 border-black px-6 py-4 bg-black text-white">
					<h3 className="text-xl font-bold display-font uppercase tracking-wider">
						{title}
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="p-1 text-white hover:bg-gray-800 transition-colors"
					>
						<X className="h-6 w-6" strokeWidth={3} />
					</button>
				</div>
				<div className="p-6">{children}</div>
			</div>
		</div>
	);
}
