import React from "react";
import { APP_NAME } from "../utils/constants";

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-invert prose-lg max-w-none space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">1. Agreement to Terms</h2>
          <p className="text-gray-300">
            By accessing or using {APP_NAME}, you agree to be bound by these Terms of Service and our Privacy Policy. 
            If you disagree with any part of the terms, then you may not access the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">2. Intellectual Property</h2>
          <p className="text-gray-300">
            The Service and its original content, features and functionality are and will remain the exclusive property of {APP_NAME} and its licensors. 
            The Service is protected by copyright, trademark, and other laws of both the country and foreign countries. 
            Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of {APP_NAME}.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">3. User Accounts</h2>
          <p className="text-gray-300 mb-4">
            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. 
            Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">4. Limitation of Liability</h2>
          <p className="text-gray-300">
            In no event shall {APP_NAME}, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">5. Governing Law</h2>
          <p className="text-gray-300">
            These Terms shall be governed and construed in accordance with the laws, without regard to its conflict of law provisions.
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">6. Changes</h2>
          <p className="text-gray-300">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
