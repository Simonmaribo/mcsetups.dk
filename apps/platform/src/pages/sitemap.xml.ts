import getSitemap from "@/api/getSitemap";
import { ServerResponse } from "http";

function generateSiteMap(routes: { url: string; lastModified: Date }[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${(routes.map(route => {
        return `
        <url>
            <loc>${route.url}</loc>
            <lastmod>${new Date(route.lastModified).toISOString()}</lastmod>
        </url>
        `;
     }).join(""))}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }: { res: ServerResponse}) {
    const pages = (await getSitemap()).map((item) => {
        return {
            url: `https://mcsetups.dk/products/${item.id}`,
            lastModified: item.updatedAt,
        }
    });

    let routes = [
        {
            url: "https://mcsetups.dk",
            lastModified: new Date(),
        },
        {
            url: "https://mcsetups.dk/about",
            lastModified: new Date(),
        },
        {
            url: "https://mcsetups.dk/products",
            lastModified: new Date(),
        }
    ]

    routes = [...routes, ...pages];

  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap(routes);

  res.setHeader('Content-Type', 'text/xml');
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;