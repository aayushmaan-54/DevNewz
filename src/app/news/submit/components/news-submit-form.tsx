"use client";
import { submitNewsAction } from "@/app/news/submit/actions/submit-news-action";
import Header from "@/app/components/header";
import { submitNewsSchema } from "@/common/validations/submit-news.schema";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import Form from "next/form";
import { useActionState } from "react";


export default function NewsSubmitForm() {
  const [lastResult, action, isPending] = useActionState(submitNewsAction, null);

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: submitNewsSchema,
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <>
      <Header text="Submit" />
      <div className="belowHeaderContainer">
        <h1 className="text-xl font-bold mb-4 pt-3">Submit News</h1>
        <Form
          action={action}
          className="flex flex-col gap-2"
          id={form.id}
          onSubmit={form.onSubmit}
        >
          {(lastResult && lastResult.status !== "success" && form.errors) && (
            <p className="error-text">{form.errors.join(", ")}</p>
          )}
          <div>
            <label htmlFor="title">
              <span className="text-muted inline-block w-10">Title: </span>
              <input
                type="text"
                id="title"
                className="input"
                name={fields.title.name}
                key={fields.title.key}
                defaultValue={fields.title.initialValue}
                disabled={isPending}
              />
              {fields.title.errors && (
                <p className="error-text">{fields.title.errors}</p>
              )}
            </label>
          </div>

          <div>
            <label htmlFor="url">
              <span className="text-muted inline-block w-10">URL: </span>
              <input
                type="text"
                id="url"
                className="input"
                name={fields.url.name}
                key={fields.url.key}
                defaultValue={fields.url.initialValue}
                disabled={isPending}
              />
              {fields.url.errors && (
                <p className="error-text">{fields.url.errors}</p>
              )}
            </label>
          </div>

          <div>
            <label htmlFor="text">
              <span className="text-muted inline-block w-10">Text: </span>
              <textarea
                id="text"
                className="input"
                rows={5} cols={40}
                name={fields.text.name}
                key={fields.text.key}
                defaultValue={fields.text.initialValue}
                disabled={isPending}
              />
              {fields.text.errors && (
                <p className="error-text">{fields.text.errors.join(", ")}</p>
              )}
            </label>
          </div>

          <button
            className="button w-fit! mb-4!"
            type="submit"
          >
            {isPending ? "Submitting..." : "Submit"}
          </button>
        </Form>

        <p className="text-muted pb-5">
          Leave url blank to submit a question for discussion. If there is no url, text will appear at the top of the thread. If there is a url, text is optional.
        </p>
      </div>
    </>
  );
}