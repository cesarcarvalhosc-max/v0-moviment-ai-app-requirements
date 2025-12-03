"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HelpCircle, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const HOW_TO_SLIDES = [
  {
    title: "Adicione à Tela Inicial",
    description: "No Safari (iOS): toque em 'Compartilhar' e depois 'Adicionar à Tela de Início'",
    description2: "No Chrome (Android): toque no menu e depois 'Adicionar à tela inicial'",
  },
  {
    title: "Seu Login",
    description: "Use o e-mail que você utilizou na compra do MovimentAI para fazer login no aplicativo.",
  },
  {
    title: "Senha Padrão",
    description: "A senha padrão para todos os usuários é: MovimentAi",
    description2: "Você pode alterá-la nas configurações após o primeiro acesso.",
  },
]

export default function SplashPage() {
  const [showHowTo, setShowHowTo] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />

      <div className="flex flex-col items-center gap-4 sm:gap-6 mb-6 sm:mb-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            Moviment<span className="text-primary">AI</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-md text-pretty px-4">
            Treinos rápidos, práticos e inteligentes. Construa consistência com IA.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm px-4 mb-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
        <Button
          size="lg"
          onClick={() => setShowHowTo(true)}
          className="w-full text-base h-12 sm:h-14 gold-gradient text-primary-foreground font-semibold touch-manipulation"
        >
          <HelpCircle className="mr-2 h-5 w-5" />
          Como usar
        </Button>

        <a href="https://pay.cakto.com.br/34gkrkt_673825" target="_blank" rel="noopener noreferrer" className="w-full">
          <Button
            size="lg"
            variant="outline"
            className="w-full text-base h-12 sm:h-14 bg-transparent touch-manipulation"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Primeiro Acesso
          </Button>
        </a>

        <Link href="/login" className="w-full">
          <Button
            size="lg"
            variant="outline"
            className="w-full text-base h-12 sm:h-14 bg-transparent touch-manipulation"
          >
            Entrar
          </Button>
        </Link>
      </div>

      <p className="text-xs text-muted-foreground text-center max-w-md mb-4 text-pretty px-4">
        O MovimentAI é um aplicativo auxiliar e não substitui acompanhamento médico ou profissionais da saúde.
      </p>

      <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-150">
        <Image
          src="/images/design-20sem-20nome-20-284-29.png"
          alt="MovimentAI Logo"
          width={160}
          height={160}
          className="object-contain"
          priority
        />
      </div>

      {/* How to use carousel dialog */}
      <Dialog open={showHowTo} onOpenChange={setShowHowTo}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Como usar o MovimentAI</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {HOW_TO_SLIDES.map((slide, idx) => (
                  <div key={idx} className="min-w-full px-2">
                    <div className="text-center space-y-4 py-6">
                      <h3 className="text-xl font-bold">{slide.title}</h3>
                      <p className="text-sm text-muted-foreground text-pretty">{slide.description}</p>
                      {slide.description2 && (
                        <p className="text-sm text-muted-foreground text-pretty">{slide.description2}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="touch-manipulation"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex gap-2">
                {HOW_TO_SLIDES.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentSlide(Math.min(HOW_TO_SLIDES.length - 1, currentSlide + 1))}
                disabled={currentSlide === HOW_TO_SLIDES.length - 1}
                className="touch-manipulation"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <Button onClick={() => setShowHowTo(false)} className="w-full mt-4 gold-gradient touch-manipulation">
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
