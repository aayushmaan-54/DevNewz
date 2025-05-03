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

  const formKey = data?.data.updatedAt || Date.now();

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

          <div>
            <label htmlFor="noProcrast" className="inline-block w-24 text-muted">noProcrast</label>
            <select
              id="noProcrast"
              name={fields.noProcrast.name}
              defaultValue={data.data.noProcrast || fields.noProcrast.initialValue || "no"}
              disabled={isPending}
              className="select"
            >
              <option value="no">no</option>
              <option value="yes">yes</option>
            </select>
            {fields.noProcrast.errors && (
              <p className="error-text">
                {fields.noProcrast.errors}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="maxVisit" className="inline-block w-24 text-muted">maxVisit: </label>
            <input
              type="number"
              name={fields.maxVisit.name}
              key={fields.maxVisit.key}
              defaultValue={data.data.maxVisit ?? fields.maxVisit.initialValue ?? ""}
              disabled={isPending}
              id="maxVisit"
              className="input"
            />
            {fields.maxVisit.errors && (
              <p className="error-text">
                {fields.maxVisit.errors}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="minAway" className="inline-block w-24 text-muted">minAway: </label>
            <input
              type="number"
              name={fields.minAway.name}
              key={fields.minAway.key}
              defaultValue={data.data.minAway ?? fields.minAway.initialValue ?? ""}
              disabled={isPending}
              id="minAway"
              className="input"
            />
            {fields.minAway.errors && (
              <p className="error-text">
                {fields.minAway.errors}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="delay" className="inline-block w-24 text-muted">delay: </label>
            <input
              type="number"
              name={fields.delay.name}
              key={fields.delay.key}
              defaultValue={data.data.delay ?? fields.delay.initialValue ?? ""}
              disabled={isPending}
              id="delay"
              className="input"
            />
            {fields.delay.errors && (
              <p className="error-text">
                {fields.delay.errors}
              </p>
            )}
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
          <Link href={`/auth/change-password`} className="link-2 w-fit visited:text-muted">change password</Link>
          <Link href={``} className="link-2 w-fit visited:text-muted">submissions</Link>
          <Link href={``} className="link-2 w-fit visited:text-muted">comments</Link>
          <Link href={``} className="link-2 w-fit visited:text-muted">upvote comments</Link>
          <Link href={``} className="link-2 w-fit visited:text-muted">downvote comments</Link>
          <Link href={``} className="link-2 w-fit visited:text-muted">upvote post</Link>
          <Link href={``} className="link-2 w-fit visited:text-muted">downvote post</Link>
        </div>
      </main>
    </>
  );
}