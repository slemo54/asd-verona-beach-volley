import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { 
  Calendar, 
  RotateCcw, 
  ShoppingBag, 
  User, 
  MapPin, 
  Phone, 
  Instagram, 
  Facebook,
  ChevronRight,
  Volleyball,
  Users,
  ArrowRight,
  Clock,
  Shirt,
  Trophy
} from "lucide-react";

// Dati degli allenatori
const coaches = [
  { initials: "MB", name: "Matteo Bosso", role: "Head Coach" },
  { initials: "EC", name: "Elena Colombi", role: "Coach" },
  { initials: "DC", name: "Davide Cagna", role: "Coach" },
  { initials: "OF", name: "Omar Franzini", role: "Coach / Atleta" },
  { initials: "AM", name: "Andrea Mazzoni", role: "Coach / Atleta" },
];

// Dati dei prossimi allenamenti
const upcomingTrainings = [
  { day: "Lun", group: "Gruppo Femminile Base", time: "18:30 - 20:00", spots: 8 },
  { day: "Mar", group: "Gruppo Maschile Medio", time: "20:00 - 21:30", spots: 6 },
  { day: "Mer", group: "Gruppo Femminile Pro", time: "18:30 - 20:00", spots: 8 },
];

// Dati prodotti merchandising
const products = [
  { id: 1, name: "T-Shirt VRB", price: "€25,00", image: "/product-1.jpg" },
  { id: 2, name: "Felpa VRB", price: "€45,00", image: "/product-2.jpg" },
  { id: 3, name: "Canotta VRB", price: "€22,00", image: "/product-3.jpg" },
  { id: 4, name: "Polo VRB", price: "€30,00", image: "/product-4.jpg" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <a href="/" className="flex items-center gap-2">
            <img 
              src="/logo-vrb.png" 
              alt="VRB Logo" 
              className="h-9 w-9 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/F97316/FFFFFF?text=VRB';
              }}
            />
            <span className="font-bold text-base tracking-tight">VRB</span>
          </a>
          <nav className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Funzionalità</a>
            <a href="#staff" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Staff</a>
            <a href="#shop" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Shop</a>
            <a href="#contatti" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contatti</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/login">
              <Button variant="ghost" size="sm">Accedi</Button>
            </a>
            <a href="/login" className="hidden sm:block">
              <Button size="sm" className="bg-gradient-to-r from-vrb-orange via-vrb-pink to-vrb-purple text-white">Registrati</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted">
          <div className="absolute inset-0 bg-gradient-to-br from-vrb-orange/10 via-vrb-pink/5 to-vrb-purple/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-vrb-orange/20 via-transparent to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <img 
              src="/logo-vrb.png" 
              alt="VRB Logo" 
              className="h-32 md:h-48 object-contain mb-8 drop-shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/F97316/FFFFFF?text=VRB';
              }}
            />
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
              Verona <span className="bg-gradient-to-r from-vrb-orange via-vrb-pink to-vrb-purple bg-clip-text text-transparent">Beach Volley</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-8">
              Gestisci allenamenti, recuperi e prenotazioni in un unico posto. 
              La passione per il beach volley a Verona dal 2010.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/login">
                <Button size="lg" className="bg-gradient-to-r from-vrb-orange via-vrb-pink to-vrb-purple text-white shadow-lg hover:shadow-xl transition-all px-8">
                  <Calendar className="h-4 w-4 mr-2" />
                  Accedi al Calendario
                </Button>
              </a>
              <a href="#features">
                <Button variant="outline" size="lg" className="border-2 px-8">
                  Scopri di più
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Grid */}
      <section id="features" className="container mx-auto px-4 py-8 -mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { icon: Calendar, title: "Calendario", desc: "Allenamenti settimanali" },
            { icon: RotateCcw, title: "Recuperi", desc: "Prenota recupero" },
            { icon: ShoppingBag, title: "Shop", desc: "Merchandising VRB" },
            { icon: User, title: "Area Personale", desc: "Dati e documenti" },
          ].map((item, idx) => (
            <a href="/login" key={idx} className="group">
              <Card className="h-full flex flex-col items-center gap-3 p-6 text-center hover:border-primary/40 hover:shadow-md transition-all cursor-pointer bg-card">
                <div className="rounded-xl p-3 bg-gradient-to-r from-vrb-orange via-vrb-pink to-vrb-purple">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </section>

      {/* Chi Siamo */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Volleyball className="h-6 w-6 text-vrb-orange" />
                <h2 className="text-3xl font-bold">Chi Siamo</h2>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                L'ASD Verona Beach Volley è un'associazione sportiva dedicata alla promozione 
                del beach volley nella città di Verona. Con oltre 130 atleti e 17 gruppi di 
                allenamento, offriamo opportunità per tutti i livelli: dal base al professionale.
              </p>
              <div className="space-y-3">
                {[
                  { color: "bg-vrb-orange", text: "Allenamenti dal lunedì al venerdì" },
                  { color: "bg-vrb-pink", text: "Fasce orarie 18:30-20:00 e 20:00-21:30" },
                  { color: "bg-vrb-purple", text: "Prenotazione campi il sabato" },
                  { color: "bg-vrb-orange", text: "Sistema di recupero lezioni" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${item.color} flex-shrink-0`} />
                    <span className="text-sm text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-vrb-orange/10 via-vrb-pink/10 to-vrb-purple/10 border-vrb-orange/20">
              <CardContent className="p-8">
                <div className="grid grid-cols-2 gap-8 text-center">
                  {[
                    { value: "136", label: "Atleti", color: "text-vrb-orange" },
                    { value: "17", label: "Gruppi", color: "text-vrb-pink" },
                    { value: "5", label: "Coach", color: "text-vrb-purple" },
                    { value: "15+", label: "Anni attività", color: "text-vrb-orange" },
                  ].map((stat, idx) => (
                    <div key={idx}>
                      <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Merchandising Section */}
      <section id="shop" className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Shirt className="h-6 w-6 text-vrb-pink" />
              <h2 className="text-3xl font-bold">Merchandising VRB</h2>
            </div>
            <a href="/login">
              <Button variant="outline" className="gap-2">
                Vedi tutto
                <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/300x300/F97316/FFFFFF?text=${encodeURIComponent(product.name)}`;
                    }}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm">{product.name}</h3>
                  <p className="text-vrb-orange font-bold mt-1">{product.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <div className="h-px bg-border" />
      </div>

      {/* Staff Section */}
      <section id="staff" className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Trophy className="h-6 w-6 text-vrb-purple" />
            <h2 className="text-3xl font-bold">Il Nostro Staff</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {coaches.map((coach) => (
              <Card key={coach.initials} className="p-6 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-vrb-orange via-vrb-pink to-vrb-purple flex items-center justify-center mb-3">
                  <span className="text-lg font-bold text-white">{coach.initials}</span>
                </div>
                <h3 className="font-semibold text-sm">{coach.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-1">{coach.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <div className="h-px bg-border" />
      </div>

      {/* Prossimi Allenamenti */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Prossimi Allenamenti</h2>
          <div className="space-y-4">
            {upcomingTrainings.map((training, idx) => (
              <Card key={idx} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-muted p-3 min-w-[60px] text-center">
                    <span className="text-sm font-bold">{training.day}</span>
                  </div>
                  <div>
                    <span className="text-base font-semibold block">{training.group}</span>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                      <Clock className="h-3.5 w-3.5" />
                      {training.time}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium rounded-full bg-green-500/20 text-green-400 px-3 py-1.5">
                  {training.spots} posti
                </span>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a href="/login">
              <Button variant="outline" className="gap-2">
                Vedi tutto il calendario
                <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-vrb-orange via-vrb-pink to-vrb-purple text-white border-0">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-80" />
              <h2 className="text-3xl font-bold mb-3">Unisciti a Noi</h2>
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                Registrati alla piattaforma per gestire i tuoi allenamenti, 
                prenotare recuperi e acquistare il merchandising ufficiale.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/login">
                  <Button size="lg" variant="secondary" className="font-semibold px-8">
                    Inizia Ora
                  </Button>
                </a>
                <a href="https://wa.me/393471234567" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                    <Phone className="h-4 w-4 mr-2" />
                    Contattaci
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer id="contatti" className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <img src="/logo-vrb.png" alt="VRB" className="h-8 w-8" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="font-bold">ASD Verona Beach Volley</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Associazione sportiva dedicata al beach volley a Verona.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-sm">Contatti</h4>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Via B. Longhena, 22 - 37138 Verona
                  </p>
                  <p>P.IVA IT05167170231</p>
                  <p>asdveronabeachvolley@gmail.com</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-sm">Social</h4>
                <div className="flex gap-3">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="https://wa.me/393471234567" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors">
                    <Phone className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="h-px bg-border mb-8" />
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} ASD Verona Beach Volley — Tutti i diritti riservati
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/393471234567" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-4 z-50 group"
        aria-label="Contattaci su WhatsApp"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
          <div className="relative bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-card text-foreground text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block border">
            Hai bisogno di aiuto?
          </div>
        </div>
      </a>
    </div>
  );
}

export default LandingPage;
