import { SkuListPage, type SearchParams } from '@tkg/sku-selling';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <SkuListPage searchParams={await searchParams} />;
}
