/* eslint-disable @typescript-eslint/no-explicit-any */
import sgMail from '@sendgrid/mail';

interface EmailParams {
  to: string;
  username: string;
  reset_link: string;
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);


export const sendEmail = async ({
  to,
  username,
  reset_link
}: EmailParams) => {
  const msg = {
    to,
    from: {
      name: "DevNewz",
      email: process.env.EMAIL_FROM!,
    },
    templateId: process.env.SENDGRID_DYNAMIC_TEMPLATE_ID!,
    dynamicTemplateData: {
      username: username,
      reset_link: reset_link
    }
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Error sending email:', error);

    if (error.response) {
      console.error(error.response.body);
    }
    return { success: false, error };
  }
};