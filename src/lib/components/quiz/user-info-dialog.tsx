"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserContext } from "@/lib/contexts/user-context";
import { UserFormFieldRendererProps, userFormSchema, UserFormValues } from "@/lib/types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/lib/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/lib/components/ui/form";
import { Input } from "@/lib/components/ui/input";
import { Button } from "@/lib/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";

interface UserInfoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: () => void;
}

export function UserInfoDialog({ open, onOpenChange, onSubmit }: UserInfoDialogProps) {
	const { toast } = useToast();
	const { setName, getName, setMail, getMail } = useUserContext();

	const form = useForm<UserFormValues>({
		resolver: zodResolver(userFormSchema),
		defaultValues: {
			name: getName() || "",
			mail: getMail() || "",
		},
	});

	const handleSubmit = (data: UserFormValues) => {
		const result = userFormSchema.safeParse(data);
		if (!result.success) {
			toast({
				title: "Fehler",
				description: "Überprüfung der Eingaben fehlgeschlagen.",
				variant: "destructive",
			});
			return;
		}

		const name = result.data.name.trim();
		setName(name.length > 0 ? name : undefined);
		setMail(result.data.mail);
		onOpenChange(false);
		onSubmit();
	};

	const handleSkip = () => {
		onOpenChange(false);
		onSubmit();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Persönliche Informationen</DialogTitle>
					<DialogDescription>
						Geben Sie optional Ihren Namen und Ihre E-Mail-Adresse ein.
						Diese werden für die Quiz-Ergebnisse verwendet.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name (Optional)</FormLabel>
									<FormControl>
										<Input
											placeholder="Geben Sie Ihren Namen ein"
											autoComplete="off"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="mail"
							render={({ field }) => (
								<FormItem>
									<FormLabel>E-Mail-Adresse (Optional)</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="mail@example.com"
											autoComplete="off"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter className="gap-2 sm:gap-0">
							<Button type="button" variant="outline" onClick={handleSkip}>
								Überspringen
							</Button>
							<Button type="submit">
								Speichern & Starten
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default UserInfoDialog;
