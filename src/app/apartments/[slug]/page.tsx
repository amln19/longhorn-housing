import ApartmentDetailClient from "./apartment-detail-client";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  
  // Format the slug to a readable name
  const name = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${name} | Longhorn Housing`,
    description: `View details, floor plans, and amenities for ${name} near UT Austin.`,
  };
}

export default async function ApartmentDetailPage({ params }: Props) {
  const { slug } = await params;
  
  return <ApartmentDetailClient slug={slug} />;
}
