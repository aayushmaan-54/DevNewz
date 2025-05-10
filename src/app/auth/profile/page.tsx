"use client";
import { useUserProfile } from "@/common/services/user-api";
import { timeAgo } from "@/common/utils/time";
import Form from "next/form"
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { updateProfileAction } from "../actions/update-profile-action";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { updateProfileSchema } from "@/common/validations/auth.schema";
import Header from "@/app/components/header";


export default function ProfilePage() {
  const { data, isLoading, error, refetch } = useUserProfile();

  const [lastResult, action, isPending] = useActionState(updateProfileAction, null);

  const formKey = data?.data?.updatedAt || Date.now();

  useEffect(() => {
    if (lastResult?.status === 'success') {
      refetch();
    }
  }, [lastResult, refetch]);


  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: updateProfileSchema,
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...data?.data,
    },
  });


  if (lastResult && lastResult.status !== "success" && form.errors) {
    alert(form.errors);
  }

  if (error) {
    alert(error.message || error.name)
  }

  if (isLoading) {
    return <p className="ml-4 mt-3">Loading...</p>
  }

  if (!data?.data) {
    return <p className="ml-4 mt-3">No profile data found</p>
  }

  return (
    <>
      <Header text="Profile" />
      <main className="belowHeaderContainer">
        <Form
          className="flex flex-col mr-4 gap-1 pt-4"
          key={formKey}
          id={form.id}
          onSubmit={form.onSubmit}
          action={action}
        >
          <div>
            <span className="inline-block w-24 text-muted">user: </span>
            <span>{data.data.username}</span>
          </div>

          <div>
            <span className="inline-block w-24 text-muted">created: </span>
            <span>{timeAgo(new Date(data.data.createdAt))}</span>
          </div>

          <div>
            <span className="inline-block w-24 text-muted">updated: </span>
            <span>{timeAgo(new Date(data.data.updatedAt))}</span>
          </div>

          <div>
            <span className="inline-block w-24 text-muted">karma: </span>
            <span>{data.data.karma}</span>
          </div>

          <div>
            <label htmlFor="about flex flex-col justify-start item-start">
              <span className="inline-block w-24 text-muted">about: </span>
              <textarea
                name={fields.about.name}
                key={fields.about.key}
                defaultValue={data.data.about || fields.about.initialValue || ""}
                disabled={isPending}
                id="about"
                className="textarea w-[300px]!"
                rows={5}
              />
              <p className="error-text">{fields.about.errors}</p>
              {fields.about.errors && (
                <p className="error-text">
                  {fields.about.errors}
                </p>
              )}
            </label>
          </div>

          <div>
            <label htmlFor="email">
              <span className="inline-block w-24 text-muted">email: </span>
              <input
                type="email"
                name={fields.email.name}
                key={fields.email.key}
                defaultValue={data.data.email || fields.email.initialValue || ""}
                disabled={isPending}
                id="email"
                className="input"
              />
              {fields.email.errors && (
                <p className="error-text">
                  {fields.email.errors}
                </p>
              )}
            </label>
          </div>

          <button
            type="submit"
            className="input w-fit!"
            disabled={isPending}
          >
            {isPending ? "Updating..." : "update"}
          </button>
        </Form>

        <div className="flex flex-col gap-1 mt-5 pb-3">
          <Link href={`/auth/change-password`} className="link-2 w-fit visited:text-muted">changePassword</Link>
          <Link href={`/news/mysubmissions`} className="link-2 w-fit visited:text-muted">submissions</Link>
          <Link href={`/news/threads`} className="link-2 w-fit visited:text-muted">comments</Link>
          <Link href={`/threads/upvoted`} className="link-2 w-fit visited:text-muted">upvoteComments</Link>
          <Link href={`/threads/downvoted`} className="link-2 w-fit visited:text-muted">downvoteComments</Link>
          <Link href={`/threads/upvotedNews`} className="link-2 w-fit visited:text-muted">upvoteNews</Link>
          <Link href={`/threads/downvotedNews`} className="link-2 w-fit visited:text-muted">downvoteNews</Link>
        </div>
      </main>
    </>
  );
}