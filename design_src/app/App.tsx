import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Image, AlertCircle, CheckCircle, Clock, Copy, Settings, ChevronDown, ChevronUp, Send, History, Download, Plus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";
import { Switch } from "./components/ui/switch";
import { Badge } from "./components/ui/badge";
import { Progress } from "./components/ui/progress";
import { Separator } from "./components/ui/separator";
import { ScrollArea } from "./components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { toast, Toaster } from "sonner";

type ViewMode = "empty" | "loading" | "success" | "error";

type GenerationTask = {
  id: string;
  title: string;
  mode: string;
  imageUrl?: string;
  status: "completed" | "failed" | "processing";
  timestamp: string;
  error?: string;
};

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("empty");
  const [healthStatus, setHealthStatus] = useState<"connected" | "offline" | "checking">("checking");
  const [backendUrl, setBackendUrl] = useState("http://localhost:3001");
  
  // Form state
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<"background" | "compose">("compose");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [stylePrompt, setStylePrompt] = useState("");
  const [waitForResult, setWaitForResult] = useState(true);
  const [useMockMode, setUseMockMode] = useState(false);
  const [maxWaitMs, setMaxWaitMs] = useState(180000);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Task state
  const [currentTaskId, setCurrentTaskId] = useState("");
  const [progress, setProgress] = useState(0);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [history, setHistory] = useState<GenerationTask[]>([]);

  // Load sample data for demo
  useEffect(() => {
    setTitle("White Sneakers");
    setPrice("$99");
    setProductImageUrl("https://images.unsplash.com/photo-1549298916-b41d501d3772");
    setFeatures(["New drop", "Daily comfort"]);
    setStylePrompt("clean marketplace card, premium background, high contrast");
    
    // Sample history
    setHistory([
      {
        id: "task_123abc",
        title: "White Sneakers",
        mode: "compose",
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
        status: "completed",
        timestamp: "2 mins ago"
      },
      {
        id: "task_456def",
        title: "Running Shoes",
        mode: "background",
        status: "failed",
        timestamp: "5 mins ago",
        error: "Provider timeout"
      }
    ]);
  }, []);

  // Check health status
  const checkHealth = async () => {
    setHealthStatus("checking");
    try {
      const response = await fetch(`${backendUrl}/api/health`);
      if (response.ok) {
        setHealthStatus("connected");
        toast.success("Backend connected");
      } else {
        setHealthStatus("offline");
      }
    } catch (error) {
      setHealthStatus("offline");
      toast.error("Backend offline - using mock mode");
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const addFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleGenerate = async (isMock: boolean) => {
    if (!title.trim()) {
      toast.error("Product title is required");
      return;
    }

    setViewMode("loading");
    setProgress(0);
    const taskId = `fcb9b822-${Date.now()}`;
    setCurrentTaskId(taskId);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 500);

    try {
      const endpoint = isMock ? `${backendUrl}/api/generate/mock` : `${backendUrl}/api/generate`;
      
      const payload = {
        title: title,
        mode: mode,
        productImageUrl: productImageUrl || undefined,
        price: price || undefined,
        features: features.length > 0 ? features : undefined,
        stylePrompt: stylePrompt || undefined,
        waitForResult: waitForResult,
        maxWaitMs: maxWaitMs
      };

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setProgress(100);

      // Mock successful response
      const mockImageUrl = "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop";
      setGeneratedImageUrl(mockImageUrl);
      setViewMode("success");
      
      toast.success(isMock ? "Mock image generated!" : "Image generated successfully!");
      
      // Add to history
      const newTask: GenerationTask = {
        id: taskId,
        title: title,
        mode: mode,
        imageUrl: mockImageUrl,
        status: "completed",
        timestamp: "Just now"
      };
      setHistory([newTask, ...history]);

    } catch (error: any) {
      clearInterval(progressInterval);
      setErrorMessage(error.message || "Failed to generate image");
      setViewMode("error");
      toast.error("Generation failed");
      
      // Add failed task to history
      const failedTask: GenerationTask = {
        id: taskId,
        title: title,
        mode: mode,
        status: "failed",
        timestamp: "Just now",
        error: error.message
      };
      setHistory([failedTask, ...history]);
    }
  };

  const copyImageUrl = () => {
    if (generatedImageUrl) {
      navigator.clipboard.writeText(generatedImageUrl);
      toast.success("Image URL copied to clipboard");
    }
  };

  const insertIntoFigma = () => {
    toast.success("Image inserted into Figma (mock action)");
  };

  const downloadImage = () => {
    toast.success("Download started (mock action)");
  };

  return (
    <TooltipProvider>
      <div className="dark min-h-screen bg-background">
        <div className="mx-auto max-w-[400px] min-h-screen bg-background">
          {/* Header */}
          <div className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
            <div className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">NanoBanana</span>
                  <span className="text-xs text-muted-foreground">Image Generator</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={healthStatus === "connected" ? "default" : "destructive"} className="text-xs">
                  {healthStatus === "connected" ? (
                    <>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Connected
                    </>
                  ) : healthStatus === "offline" ? (
                    <>
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Offline
                    </>
                  ) : (
                    <>
                      <Clock className="mr-1 h-3 w-3 animate-spin" />
                      Checking
                    </>
                  )}
                </Badge>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={checkHealth}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-73px)]">
            <div className="space-y-4 p-4">
              {/* Main Form Section */}
              <Card className="border-border bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-base">Generate Image</CardTitle>
                  <CardDescription className="text-xs">Configure your product image settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm">
                      Product Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="White Sneakers"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>

                  {/* Mode */}
                  <div className="space-y-2">
                    <Label htmlFor="mode" className="text-sm">Mode</Label>
                    <Select value={mode} onValueChange={(v) => setMode(v as "background" | "compose")}>
                      <SelectTrigger id="mode" className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="background">Background</SelectItem>
                        <SelectItem value="compose">Compose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Product Image URL */}
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl" className="text-sm">Product Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="imageUrl"
                        placeholder="https://..."
                        value={productImageUrl}
                        onChange={(e) => setProductImageUrl(e.target.value)}
                        className="h-9 text-sm flex-1"
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="outline" className="h-9 text-xs">
                            <Image className="h-3 w-3 mr-1" />
                            Figma
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Upload from Figma selection</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Optional Fields (Collapsible) */}
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-between h-9 text-sm px-0 hover:bg-transparent"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      <span className="text-muted-foreground">Optional fields</span>
                      {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>

                    {showAdvanced && (
                      <div className="space-y-4 pt-2">
                        {/* Price */}
                        <div className="space-y-2">
                          <Label htmlFor="price" className="text-sm">Price</Label>
                          <Input
                            id="price"
                            placeholder="$99"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          <Label htmlFor="features" className="text-sm">Features</Label>
                          <div className="flex gap-2">
                            <Input
                              id="features"
                              placeholder="Add a feature..."
                              value={featureInput}
                              onChange={(e) => setFeatureInput(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                              className="h-9 text-sm flex-1"
                            />
                            <Button size="sm" variant="outline" onClick={addFeature} className="h-9">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          {features.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {features.map((feature, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {feature}
                                  <button
                                    onClick={() => removeFeature(index)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Style Prompt */}
                        <div className="space-y-2">
                          <Label htmlFor="stylePrompt" className="text-sm">Style Prompt</Label>
                          <Textarea
                            id="stylePrompt"
                            placeholder="clean marketplace card, premium background, high contrast"
                            value={stylePrompt}
                            onChange={(e) => setStylePrompt(e.target.value)}
                            className="min-h-[60px] text-sm resize-none"
                          />
                        </div>

                        <Separator />

                        {/* Advanced Toggles */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="waitForResult" className="text-sm cursor-pointer">
                                Wait for result
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Block until image is ready
                              </p>
                            </div>
                            <Switch
                              id="waitForResult"
                              checked={waitForResult}
                              onCheckedChange={setWaitForResult}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="useMockMode" className="text-sm cursor-pointer">
                                Use Mock mode
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Test with /api/generate/mock
                              </p>
                            </div>
                            <Switch
                              id="useMockMode"
                              checked={useMockMode}
                              onCheckedChange={setUseMockMode}
                            />
                          </div>
                        </div>

                        {/* Max Wait Time */}
                        <div className="space-y-2">
                          <Label htmlFor="maxWait" className="text-sm">Max wait time (ms)</Label>
                          <Input
                            id="maxWait"
                            type="number"
                            value={maxWaitMs}
                            onChange={(e) => setMaxWaitMs(Number(e.target.value))}
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  size="lg"
                  className="w-full h-11"
                  onClick={() => handleGenerate(false)}
                  disabled={viewMode === "loading"}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Generate Real
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => handleGenerate(true)}
                  disabled={viewMode === "loading"}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Mock
                </Button>
              </div>

              {/* Status & Progress Area */}
              <Card className="border-border bg-card/50 backdrop-blur">
                <CardContent className="pt-6">
                  {viewMode === "empty" && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Image className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-sm font-medium text-foreground mb-1">Ready to generate</h3>
                      <p className="text-xs text-muted-foreground">
                        Configure your settings and click Generate
                      </p>
                    </div>
                  )}

                  {viewMode === "loading" && (
                    <div className="space-y-4 py-8">
                      <div className="flex flex-col items-center justify-center text-center mb-4">
                        <Clock className="h-12 w-12 text-primary animate-pulse mb-3" />
                        <h3 className="text-sm font-medium text-foreground mb-1">Processing...</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          Waiting for NanoBanana AI
                        </p>
                        <Badge variant="secondary" className="text-xs font-mono">
                          Task ID: {currentTaskId}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-center text-muted-foreground">{progress}%</p>
                      </div>
                    </div>
                  )}

                  {viewMode === "success" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h3 className="text-sm font-medium text-foreground">Generation complete!</h3>
                      </div>
                      
                      <div className="relative overflow-hidden rounded-lg border-2 border-border bg-muted">
                        <img
                          src={generatedImageUrl}
                          alt="Generated product"
                          className="w-full h-auto aspect-square object-cover"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Image URL</Label>
                        <div className="flex gap-2">
                          <Input
                            value={generatedImageUrl}
                            readOnly
                            className="h-9 text-xs font-mono flex-1"
                          />
                          <Button size="sm" variant="outline" onClick={copyImageUrl} className="h-9">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={insertIntoFigma} className="h-9 text-xs">
                          <Image className="mr-1 h-3 w-3" />
                          Insert into Figma
                        </Button>
                        <Button size="sm" variant="outline" onClick={downloadImage} className="h-9 text-xs">
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}

                  {viewMode === "error" && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                      </div>
                      <h3 className="text-sm font-medium text-foreground mb-2">Generation failed</h3>
                      <p className="text-xs text-muted-foreground max-w-[280px]">
                        {errorMessage || "An error occurred during generation. Please try again."}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4 h-9 text-xs"
                        onClick={() => setViewMode("empty")}
                      >
                        Try again
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* History Section */}
              {history.length > 0 && (
                <Card className="border-border bg-card/50 backdrop-blur">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Recent generations</CardTitle>
                      <History className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-2">
                        {history.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                          >
                            {task.imageUrl ? (
                              <img
                                src={task.imageUrl}
                                alt={task.title}
                                className="h-12 w-12 rounded border border-border object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded border border-border bg-muted flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {task.title}
                                </p>
                                <Badge
                                  variant={task.status === "completed" ? "default" : "destructive"}
                                  className="text-[10px] h-4 px-1.5"
                                >
                                  {task.status}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground font-mono truncate">
                                {task.id}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {task.timestamp}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Footer */}
              <div className="space-y-3 pb-4">
                <Separator />
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Backend:</span>
                    <Input
                      value={backendUrl}
                      onChange={(e) => setBackendUrl(e.target.value)}
                      className="h-7 text-xs font-mono w-48"
                    />
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </Button>
                </div>
                <div className="text-center">
                  <a
                    href="#"
                    className="text-xs text-primary hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("API documentation (mock link)");
                    }}
                  >
                    View API Docs
                  </a>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
        
        <Toaster position="bottom-center" theme="dark" />
      </div>
    </TooltipProvider>
  );
}
