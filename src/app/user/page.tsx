"use client";

import * as Ui from "@/lib/components/ui/";
import React, { Suspense } from "react";
import { useUserContext } from "@/lib/contexts/user-context";
import { useRouter, useSearchParams } from "next/navigation";
import ContentPane from "@/lib/components/content-pane";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserFormFieldRendererProps, userFormSchema, UserFormValues } from "@/lib/types";
import { useToast } from "@/lib/hooks/use-toast";

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
		<ContentPane defaultColor={true} className="w-4/5 lg:w-2/3 2xl:w-1/3">
			<h3 className="text-2xl mb-6">
				<strong>
					Geben Sie Ihren Namen und Ihre E-Mail-Adresse ein
				</strong>
			</h3>
			
			<Ui.Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<Ui.FormField control={form.control} name="name" render={NameFormFieldRenderer}/>
					<Ui.FormField control={form.control} name="mail" render={MailFormFieldRenderer}/>
					
					<Ui.Button type="submit" className="w-full">
						Weiter
					</Ui.Button>
				</form>
			</Ui.Form>
		</ContentPane>
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
