"use client";

import * as Ui from "@/lib/components/ui/";
import React, { Suspense, useState } from "react";
import { useNameContext } from "@/lib/contexts/name-context";
import { useRouter, useSearchParams } from "next/navigation";
import ContentPane from "@/lib/components/content-pane";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { NameFormFieldRendererProps, nameFormSchema, NameFormValues } from "@/lib/types";
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
	const { setName, getName } = useNameContext();
	
	const [inputName, setInputName] = useState(getName() || "");
	const router = useRouter();
	const searchParams = useSearchParams();
	
	const redirect = decodeURIComponent(searchParams.get("redirect") || "/");
	
	const form = useForm<NameFormValues>({
		resolver: zodResolver(nameFormSchema),
		defaultValues: {
			name: inputName,
		},
	});
	
	const onSubmit = (data: NameFormValues) => {
		const result = nameFormSchema.safeParse(data);
		if (!result.success) {
			toast({
				title: "Error",
				description: "Form validation failed",
				variant: "destructive",
			});
			return;
		}
		
		setName(result.data.name.trim());
		router.push(redirect);
	};
	
	return (
		<ContentPane defaultColor={true} className="w-4/5 lg:w-2/3 2xl:w-1/3">
			<h3 className="text-2xl mb-6">
				<strong>
					Enter your name
				</strong>
			</h3>
			
			<Ui.Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<Ui.FormField control={form.control} name="name" render={NameFormFieldRenderer}/>
					
					<Ui.Button type="submit" className="w-full">
						Continue
					</Ui.Button>
				</form>
			</Ui.Form>
		</ContentPane>
	);
}

function NameFormFieldRenderer(
	{ field }: NameFormFieldRendererProps<"name">,
) {
	return (
		<FormFieldRenderer label="Name (Optional)">
			<Ui.Input placeholder="Enter your name" autoComplete="off" autoFocus {...field}/>
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
