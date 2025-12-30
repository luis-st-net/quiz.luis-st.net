"use client";

import * as Ui from "@/lib/components/ui/";
import React, { Suspense } from "react";
import { useUserContext } from "@/lib/contexts/user-context";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserFormFieldRendererProps, userFormSchema, UserFormValues } from "@/lib/types";
import { useToast } from "@/lib/hooks/use-toast";
import { User } from "lucide-react";

export default function NamePage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<NamePageContent/>
		</Suspense>
	);
}

function NamePageContent() {
	const { toast } = useToast();
	const { setName, getName, setMail, getMail } = useUserContext();
	
	const router = useRouter();
	const searchParams = useSearchParams();
	
	const redirect = decodeURIComponent(searchParams.get("redirect") || "/");
	
	const form = useForm<UserFormValues>({
		resolver: zodResolver(userFormSchema),
		defaultValues: {
			name: getName() || "",
			mail: getMail() || "",
		},
	});
	
	const onSubmit = (data: UserFormValues) => {
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
		router.push(redirect);
	};
	
	return (
		<div className="flex items-center justify-center min-h-full p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="size-5" />
						Benutzerinformationen
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground mb-6">
						Geben Sie Ihren Namen und Ihre E-Mail-Adresse ein
					</p>
					<Ui.Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<Ui.FormField control={form.control} name="name" render={NameFormFieldRenderer}/>
							<Ui.FormField control={form.control} name="mail" render={MailFormFieldRenderer}/>

							<Ui.Button type="submit" className="w-full">
								Weiter
							</Ui.Button>
						</form>
					</Ui.Form>
				</CardContent>
			</Card>
		</div>
	);
}

function NameFormFieldRenderer(
	{ field }: UserFormFieldRendererProps<"name">,
) {
	return (
		<FormFieldRenderer label="Name (Optional)">
			<Ui.Input placeholder="Geben Sie Ihren Namen ein" autoComplete="off" autoFocus {...field}/>
		</FormFieldRenderer>
	);
}

function MailFormFieldRenderer(
	{ field }: UserFormFieldRendererProps<"mail">,
) {
	return (
		<FormFieldRenderer label="E-Mail-Adresse (Optional)">
			<Ui.Input type="email" placeholder="mail@example.com" autoComplete="off" {...field} />
		</FormFieldRenderer>
	);
}

function FormFieldRenderer(
	{ label, children }: { label: string, children: React.ReactNode },
) {
	return (
		<Ui.FormItem>
			<Ui.FormLabel>
				{label}
			</Ui.FormLabel>
			<Ui.FormControl>
				{children}
			</Ui.FormControl>
			<Ui.FormMessage/>
		</Ui.FormItem>
	);
}
