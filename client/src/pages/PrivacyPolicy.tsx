import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Button>
          </Link>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">📄 Privacy Policy</CardTitle>
            <p className="text-muted-foreground mt-2">Restaurant Club</p>
            <p className="text-sm text-muted-foreground mt-1">Effective Date: 2/12/2026</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  Restaurant Club ("we," "our," or "us") operates the Restaurant Club mobile application (the "App").
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                  This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                  By using the App, you agree to the collection and use of information in accordance with this policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
                
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">A. Account Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">When you create an account, we may collect:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Profile photo (if provided)</li>
                  </ul>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">B. Club & Activity Data</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">To provide core functionality, we collect:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Dinner club names and member lists</li>
                    <li>Restaurant selections and visit history</li>
                    <li>Event dates and scheduling information</li>
                    <li>Notes or comments you add</li>
                  </ul>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">C. Device Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    We may automatically collect limited technical data such as:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Device type</li>
                    <li>Operating system</li>
                    <li>App version</li>
                    <li>Basic usage diagnostics</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    This information is used to improve app performance and reliability.
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">D. Location Data (If Enabled)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    If you grant permission, the App may access approximate location data to help suggest nearby restaurants.
                    You can disable location access at any time in your device settings.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    We do not track precise background location.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-2">We use collected information to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Create and manage your account</li>
                  <li>Enable dinner club coordination</li>
                  <li>Store restaurant history and milestones</li>
                  <li>Improve app performance</li>
                  <li>Provide customer support</li>
                  <li>Ensure security and prevent abuse</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3 font-semibold">
                  We do not sell your personal information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. Data Storage & Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your data is securely stored using trusted third-party infrastructure providers (such as Supabase and cloud hosting services).
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                  We implement reasonable administrative, technical, and physical safeguards to protect your information.
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                  However, no system can guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Data Sharing</h2>
                <p className="text-gray-700 leading-relaxed font-semibold mb-2">
                  We do not sell, rent, or trade your personal information.
                </p>
                <p className="text-gray-700 leading-relaxed mb-2">We may share data only:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>With service providers necessary to operate the App (e.g., hosting and authentication providers)</li>
                  <li>If required by law</li>
                  <li>To protect the safety and integrity of the platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your information as long as your account is active.
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                  If you delete your account, we will delete or anonymize your personal data within a reasonable timeframe, except where retention is required by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Your Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-2">
                  Depending on your jurisdiction, you may have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Access your personal data</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Withdraw consent where applicable</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  To exercise these rights, contact us at:
                </p>
                <p className="text-gray-700 leading-relaxed mt-1">
                  <a href="mailto:brendanpinder0@gmail.com" className="text-orange-600 hover:underline">
                    brendanpinder0@gmail.com
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Restaurant Club is not intended for children under 13 years old.
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                  We do not knowingly collect personal data from children.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">9. Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time.
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                  Changes will be reflected with an updated "Effective Date."
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                  Continued use of the App after changes constitutes acceptance of the revised policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-2">
                  If you have any questions about this Privacy Policy, contact:
                </p>
                <div className="text-gray-700 space-y-1 ml-4">
                  <p>
                    <strong>Email:</strong>{" "}
                    <a href="mailto:brendanpinder0@gmail.com" className="text-orange-600 hover:underline">
                      brendanpinder0@gmail.com
                    </a>
                  </p>
                  <p><strong>Company:</strong> Restaurant Club</p>
                  <p><strong>Location:</strong> United States</p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
