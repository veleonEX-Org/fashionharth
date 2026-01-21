import React from "react";
import { APP_NAME, PRIVACY_EMAIL } from "../utils/constants";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-invert prose-lg max-w-none space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">1. Introduction</h2>
          <p className="text-gray-300">
            Welcome to {APP_NAME}. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website 
            and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">2. The Data We Collect</h2>
          <p className="text-gray-300 mb-4">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li><strong className="text-white">Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong className="text-white">Contact Data</strong> includes email address and telephone numbers.</li>
            <li><strong className="text-white">Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
            <li><strong className="text-white">Usage Data</strong> includes information about how you use our website, products and services.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">3. How We Use Your Data</h2>
          <p className="text-gray-300 mb-4">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal or regulatory obligation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">4. Data Security</h2>
          <p className="text-gray-300">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">5. Contact Us</h2>
          <p className="text-gray-300">
            If you have any questions about this privacy policy or our privacy practices, please contact us at:{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-primary hover:underline">{PRIVACY_EMAIL}</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
