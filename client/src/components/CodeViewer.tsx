import { Highlight, themes } from "prism-react-renderer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CodeViewerProps {
  files: Record<string, string>;
}

export function CodeViewer({ files }: CodeViewerProps) {
  const filenames = Object.keys(files);
  const [activeFile, setActiveFile] = useState(filenames[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (filenames.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/20">
      <Tabs defaultValue={filenames[0]} value={activeFile} onValueChange={setActiveFile} className="w-full">
        <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border">
          <TabsList className="bg-transparent p-0 h-auto space-x-2">
            {filenames.map((filename) => (
              <TabsTrigger
                key={filename}
                value={filename}
                className="
                  data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/30 
                  border border-transparent px-3 py-1.5 rounded-md text-xs font-mono transition-all
                "
              >
                {filename}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-3 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        {filenames.map((filename) => (
          <TabsContent key={filename} value={filename} className="m-0 p-0">
            <ScrollArea className="h-[500px] w-full bg-[#0d1117]">
              <div className="p-6">
                <Highlight
                  theme={themes.vsDark}
                  code={files[filename]}
                  language={filename.endsWith('tf') ? 'hcl' : 'bash'}
                >
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre style={style} className="font-mono text-sm leading-relaxed">
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })} className="table-row">
                          <span className="table-cell select-none text-muted-foreground/30 text-right pr-4 w-10 text-xs">
                            {i + 1}
                          </span>
                          <span className="table-cell">
                            {line.map((token, key) => (
                              <span key={key} {...getTokenProps({ token })} />
                            ))}
                          </span>
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
