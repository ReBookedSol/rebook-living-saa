import Layout from "@/components/Layout";
import BursaryPackGenerator from "@/components/BursaryPackGenerator";

const BursaryPacks = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            AI Bursary Pack Generator
          </h1>
          <p className="text-muted-foreground">
            Get personalized accommodation and bursary recommendations powered by AI
          </p>
        </div>
        <BursaryPackGenerator />
      </div>
    </Layout>
  );
};

export default BursaryPacks;