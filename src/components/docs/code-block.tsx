interface CodeBlockProps {
    code: string;
    language?: string;
    title?: string;
}

export function CodeBlock({ code, language, title }: CodeBlockProps) {
    return (
        <div className="not-prose my-6">
            {title && (
                <div className="rounded-t-lg border border-b-0 border-border bg-muted/30 px-4 py-2 text-sm font-medium text-muted-foreground">
                    {title}
                </div>
            )}
            <pre
                className={`overflow-x-auto border border-border bg-muted/50 p-4 font-mono text-sm ${
                    title ? 'rounded-b-lg' : 'rounded-lg'
                }`}
            >
                <code className="text-foreground">{code}</code>
            </pre>
        </div>
    );
}
