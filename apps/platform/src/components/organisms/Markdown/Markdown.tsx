import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkFlexibleContainers from "remark-flexible-containers";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import videoIframes from './plugins/VideoIframes'
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import dark from 'react-syntax-highlighter/dist/cjs/styles/prism/dracula'
import styles from "./Markdown.module.css"

export default function Markdown({ value }: { value: string }){

    // replace \\\\n with new line
    let formattedValue = value ? value.replace(/\\n/g, "\n") : '';

    return ( 
        <div className={styles.markdownbody} style={{ overflow: 'hidden'}}>
            <ReactMarkdown 
                remarkPlugins={[
                    [videoIframes],
                    [remarkGfm], 
                    [remarkFlexibleContainers],
                    [remarkRehype as any, { allowDangerousHtml: true }],
                ]} 
                rehypePlugins={[
                    [rehypeRaw],
                    [rehypeSanitize, {
                        ...defaultSchema,
                        attributes: {
                            ...defaultSchema.attributes,
                            '*': ['className', 'style'],
                            img: ['src', 'alt'],
                        }
                    }],
                ]}
                components={{
                    code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                            <SyntaxHighlighter
                                // @ts-ignore
                                style={dark}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                            >{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
                            ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        )
                    },
                    p({node, className, children, ...props}) {
                        const match = /src="(.*)"/.exec(String(children));
                        if(match && match[1].startsWith('https://www.youtube.com/embed/')){
                            return (
                                <iframe 
                                    className={className}
                                    {...props}
                                    src={match[1]}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    frameBorder="0"
                                    height="315"
                                    width="560"
                                />
                            )
                        } else {
                            return (
                                <p className={className} {...props}>
                                    {children}
                                </p>
                            )
                        }
                    }
                }}
            >{formattedValue}</ReactMarkdown>
        </div>
    )
}