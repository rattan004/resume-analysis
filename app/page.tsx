import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">AI Resume Screening Tool</h1>
          <p className="text-xl text-muted-foreground mb-8">Intelligent candidate analysis and ranking powered by AI</p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Frontend App */}
          <Card>
            <CardHeader>
              <CardTitle>React Frontend Application</CardTitle>
              <CardDescription>Main application interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The full-featured React application with resume upload, analysis, and candidate ranking.
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Location:</strong> http://localhost:5173
                </p>
                <p>
                  <strong>Technology:</strong> React + Vite
                </p>
                <p>
                  <strong>Features:</strong>
                </p>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li>User authentication</li>
                  <li>Resume upload & analysis</li>
                  <li>Candidate ranking</li>
                  <li>Detailed results</li>
                </ul>
              </div>
              <Button asChild className="w-full">
                <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer">
                  Open React App →
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Backend API */}
          <Card>
            <CardHeader>
              <CardTitle>Express.js Backend API</CardTitle>
              <CardDescription>RESTful API server</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The backend API that powers the application with authentication, analysis, and data management.
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Location:</strong> http://localhost:5000
                </p>
                <p>
                  <strong>Technology:</strong> Express.js + Node.js
                </p>
                <p>
                  <strong>Endpoints:</strong>
                </p>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li>/api/auth - Authentication</li>
                  <li>/api/analysis - Resume analysis</li>
                  <li>/api/candidates - Candidate data</li>
                  <li>/api/contact - Contact form</li>
                </ul>
              </div>
              <Button asChild className="w-full">
                <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer">
                  Check API Health →
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>How to run the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-3">Quick Start (Recommended)</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                  <p className="text-muted-foreground"># Windows</p>
                  <p>start-dev.bat</p>
                  <p className="text-muted-foreground mt-4"># Mac/Linux</p>
                  <p>chmod +x start-dev.sh</p>
                  <p>./start-dev.sh</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Manual Start</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                  <p className="text-muted-foreground"># Terminal 1</p>
                  <p>npm run server:dev</p>
                  <p className="text-muted-foreground mt-4"># Terminal 2</p>
                  <p>npm run frontend</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Account */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Test Account</CardTitle>
            <CardDescription>Use these credentials to test the application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-mono">john@example.com</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Password</p>
                <p className="font-mono">password</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>Learn more about the project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Quick References</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-primary hover:underline">
                      QUICK_START.md - Get started in 5 minutes
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline">
                      README.md - Project overview
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline">
                      SETUP_GUIDE.md - Detailed setup
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Advanced Guides</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-primary hover:underline">
                      INTEGRATION_SUMMARY.md - How it works
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline">
                      TROUBLESHOOTING.md - Common issues
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline">
                      INTEGRATION_CHECKLIST.md - Verification
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 text-sm text-muted-foreground">
          <p>
            This is the Next.js landing page. The main application runs on{" "}
            <a href="http://localhost:5173" className="text-primary hover:underline">
              http://localhost:5173
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
