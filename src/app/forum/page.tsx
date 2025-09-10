import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, UserCircle } from "lucide-react";

export default function ForumPage() {
  const posts = [
    {
      author: "CorazónEsperanzado",
      time: "Hace 2 horas",
      content: "Hoy fue un día difícil, pero logré almorzar adecuadamente sin sentirme culpable. Es una pequeña victoria, pero se siente enorme. Solo quería compartirlo con personas que pudieran entender.",
      likes: 12,
      comments: 3,
    },
    {
      author: "LadoPositivo",
      time: "Hace 8 horas",
      content: "¿Alguien tiene consejos para lidiar con los comentarios familiares sobre la comida durante la cena? Tengo una reunión familiar este fin de semana y ya me siento ansioso.",
      likes: 25,
      comments: 8,
    },
    {
      author: "ObservadorSilencioso",
      time: "Hace 1 día",
      content: "Solo leer las historias de todos aquí me hace sentir menos solo. Gracias a todos por ser tan valientes y abiertos. Me da fuerza.",
      likes: 42,
      comments: 5,
    },
  ];
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Foro Comunitario</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Un espacio seguro y anónimo para compartir, conectar y apoyarse mutuamente. No estás solo en este viaje.
            </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Comparte tus Pensamientos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea placeholder="¿Qué tienes en mente? Comparte tu historia o haz una pregunta..." rows={4} />
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button>Publicar Anónimamente</Button>
                </CardFooter>
            </Card>

            <div className="space-y-6">
                {posts.map((post, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <UserCircle className="w-8 h-8 text-muted-foreground" />
                                <div>
                                    <p className="font-bold">{post.author}</p>
                                    <p className="text-xs text-muted-foreground">{post.time}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground/90">{post.content}</p>
                        </CardContent>
                        <CardFooter className="flex items-center gap-6 text-sm text-muted-foreground">
                            <button className="flex items-center gap-2 hover:text-primary-foreground">
                                <ThumbsUp className="w-4 h-4" />
                                <span>{post.likes} Me gusta</span>
                            </button>
                            <button className="flex items-center gap-2 hover:text-primary-foreground">
                                <MessageSquare className="w-4 h-4" />
                                <span>{post.comments} Comentarios</span>
                            </button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
      </main>
    </>
  );
}
