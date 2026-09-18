import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Heart, Star, Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-serif font-bold text-primary">Amendoim Sabor Arte</div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#produtos" className="text-foreground hover:text-primary transition-colors">
              Produtos
            </a>
            <a href="#sobre" className="text-foreground hover:text-primary transition-colors">
              Sobre Nós
            </a>
            <a href="#depoimentos" className="text-foreground hover:text-primary transition-colors">
              Depoimentos
            </a>
            <a href="#contato" className="text-foreground hover:text-primary transition-colors">
              Contato
            </a>
          </nav>
          <Button className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            Comprar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-accent to-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary mb-6 text-balance">
                O Sabor que é uma Obra de Arte
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Amendoim caramelizado artesanal, feito com ingredientes selecionados e muito carinho. Cada grão é uma
                experiência única de sabor e crocância.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Compre Agora
                </Button>
                <Button size="lg" variant="outline">
                  Saiba Mais
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://placehold.co/600x600?text=Amendoim+caramelizado+artesanal+em+pote+de+vidro+elegante+com+fita+dourada+e+amendoins+espalhados+sobre+superficie+de+madeira+rustica"
                alt="Amendoim caramelizado artesanal em pote de vidro elegante com fita dourada e amendoins espalhados sobre superficie de madeira rustica"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-secondary p-6 rounded-lg shadow-xl">
                <div className="flex items-center gap-2 text-secondary-foreground">
                  <Heart className="w-6 h-6 fill-current" />
                  <span className="font-bold text-lg">100% Artesanal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Produtos Section */}
      <section id="produtos" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Nosso Produto</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Amendoim caramelizado artesanal com açúcar e corante vermelho para uma cor irresistível
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="https://placehold.co/500x400?text=Amendoim+caramelizado+vermelho+brilhante+em+closeup+mostrando+camada+de+acucar+cristalizado+com+tonalidade+vermelha+atraente"
                alt="Amendoim caramelizado vermelho brilhante em closeup mostrando camada de acucar cristalizado com tonalidade vermelha atraente"
                className="w-full h-80 object-cover"
              />
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <h3 className="text-3xl font-serif font-bold mb-3 text-card-foreground">Amendoim Caramelizado</h3>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Nosso amendoim caramelizado com açúcar e um toque de corante vermelho que realça a beleza e o sabor.
                  Crocante, doce e com aquela cor vibrante que conquista à primeira vista.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary">R$ 25,00</span>
                  <Button size="lg">Adicionar ao Carrinho</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Depoimentos Section */}
      <section id="depoimentos" className="py-20 bg-accent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-8">O Que Dizem Nossos Clientes</h2>
            <div className="bg-background rounded-xl p-12 shadow-xl">
              <div className="flex items-center justify-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-8 h-8 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-2xl text-foreground font-medium leading-relaxed text-pretty">
                Todos que experimentam nosso amendoim caramelizado se apaixonam pelo sabor único e pela crocância
                perfeita. A combinação especial de açúcar com o toque de cor vibrante torna cada mordida uma experiência
                inesquecível. Não é à toa que nossos clientes sempre voltam para mais!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contato Section */}
      <section id="contato" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Entre em Contato</h2>
              <p className="text-xl text-muted-foreground">Estamos prontos para atender você</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold mb-2 text-card-foreground">Telefone</h3>
                  <p className="text-muted-foreground">(11) 98765-4321</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold mb-2 text-card-foreground">E-mail</h3>
                  <p className="text-muted-foreground">contato@saborarte.com.br</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold mb-2 text-card-foreground">Localização</h3>
                  <p className="text-muted-foreground">São Paulo, SP</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-4">Amendoim Sabor Arte</h3>
              <p className="text-primary-foreground/80">Tradição e qualidade em cada grão</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>
                  <a href="#produtos" className="hover:text-primary-foreground transition-colors">
                    Produtos
                  </a>
                </li>
                <li>
                  <a href="#sobre" className="hover:text-primary-foreground transition-colors">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a href="#depoimentos" className="hover:text-primary-foreground transition-colors">
                    Depoimentos
                  </a>
                </li>
                <li>
                  <a href="#contato" className="hover:text-primary-foreground transition-colors">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Informações</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Política de Privacidade</li>
                <li>Termos de Uso</li>
                <li>Formas de Pagamento</li>
                <li>Entrega</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Redes Sociais</h4>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/80">
            <p>&copy; 2025 Amendoim Sabor Arte. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
