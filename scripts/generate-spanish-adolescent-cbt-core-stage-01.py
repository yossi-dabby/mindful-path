#!/usr/bin/env python3
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import simpleSplit

OUT = Path("public/forms/es/adolescents/cbt-core/stage-01")
OUT.mkdir(parents=True, exist_ok=True)
W, H = A4

FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
pdfmetrics.registerFont(TTFont("DV", FONT_REG))
pdfmetrics.registerFont(TTFont("DV-B", FONT_BOLD))

TEAL = HexColor("#176B68")
DARK = HexColor("#173B3A")
MINT = HexColor("#DDEFE9")
PALE = HexColor("#F7F2E7")
GOLD = HexColor("#E5B76B")
CORAL = HexColor("#E39A7B")
LINE = HexColor("#7EAAA4")
INK = HexColor("#244443")

def wrap(c, text, x, y, width, font="DV", size=8.6, leading=11, color=INK, max_lines=None):
    c.setFont(font, size); c.setFillColor(color)
    lines = simpleSplit(text, font, size, width)
    if max_lines: lines = lines[:max_lines]
    for line in lines:
        c.drawString(x, y, line); y -= leading
    return y

def pill(c, x, y, text, width=None):
    width = width or max(60, pdfmetrics.stringWidth(text, "DV-B", 7)+18)
    c.setFillColor(MINT); c.roundRect(x, y-11, width, 16, 8, fill=1, stroke=0)
    c.setFillColor(TEAL); c.setFont("DV-B", 7); c.drawCentredString(x+width/2, y-6, text)

def checkbox(c, x, y, label, size=8.0, maxw=125):
    c.setStrokeColor(TEAL); c.setLineWidth(.8); c.rect(x, y-7, 7, 7, fill=0, stroke=1)
    return wrap(c, label, x+12, y, maxw, size=size, leading=9.5)

def field_lines(c, x, y, width, count=3, gap=18):
    c.setStrokeColor(LINE); c.setLineWidth(.6)
    for i in range(count):
        yy=y-i*gap; c.line(x, yy, x+width, yy)
    return y-count*gap

def section(c, num, title, x, y, width):
    c.setFillColor(TEAL); c.circle(x+9, y-3, 9, fill=1, stroke=0)
    c.setFillColor(white); c.setFont("DV-B", 8); c.drawCentredString(x+9, y-6, str(num))
    c.setFillColor(DARK); c.setFont("DV-B", 10.2)
    lines=simpleSplit(title,"DV-B",10.2,width-26)
    yy=y
    for line in lines: c.drawString(x+24,yy,line); yy-=12
    c.setStrokeColor(MINT); c.setLineWidth(1); c.line(x,yy-2,x+width,yy-2)
    return yy-14

def base(c, number, title, subtitle):
    c.setFillColor(PALE); c.rect(0,0,W,H,fill=1,stroke=0)
    c.setFillColor(MINT); c.circle(38,H-38,54,fill=1,stroke=0)
    c.setFillColor(HexColor("#CFE6E1")); c.circle(W-28,H-70,65,fill=1,stroke=0)
    c.setFillColor(CORAL); c.circle(W-45,58,36,fill=1,stroke=0)
    c.setFillColor(TEAL); c.roundRect(28,H-72,62,24,12,fill=1,stroke=0)
    c.setFillColor(white); c.setFont("DV-B",12); c.drawCentredString(59,H-65,number)
    c.setFillColor(TEAL); c.setFont("DV-B",7.5)
    c.drawString(104,H-54,"SERIE CENTRAL DE TCC | SERIE 1: COMPRENDER, ELEGIR Y ACTUAR")
    c.setFillColor(DARK); c.setFont("DV-B",20)
    title_lines=simpleSplit(title,"DV-B",20,W-150)
    y=H-87
    for line in title_lines: c.drawString(104,y,line); y-=23
    y=wrap(c,subtitle,104,y-2,W-145,size=8.5,leading=11,color=INK)
    return min(y-10,H-142)

def footer(c, number):
    c.setFillColor(TEAL); c.setFont("DV-B",7)
    c.drawCentredString(W/2,18,f"SERIE 1 | COMPRENDER, ELEGIR Y ACTUAR | {number}")

def reminder(c, title, lines, x, y, w):
    h=30+14*len(lines)
    c.setFillColor(MINT); c.roundRect(x,y-h,w,h,10,fill=1,stroke=0)
    c.setFillColor(TEAL); c.setFont("DV-B",8.5); c.drawString(x+12,y-17,title)
    yy=y-31
    for line in lines: yy=wrap(c,line,x+12,yy,w-24,size=7.7,leading=10)
    return y-h

def page_11(path):
    c=canvas.Canvas(str(path),pagesize=A4)
    y=base(c,"1.1","¿Qué me está pasando ahora mismo?","Reconoce tu estado actual y empieza a comprender lo que estás viviendo.")
    x=55; width=W-110
    y=wrap(c,"Tómate un momento para hacer una pausa y observar cómo estás. ¿Qué te está pasando ahora mismo?",x,y,width,font="DV-B",size=10,leading=13)
    y-=10; y=field_lines(c,x,y,width,5,26)
    y-=8; y=section(c,"✓","Mis respuestas me ayudarán a:",x,y,width)
    for item in ["Comprender lo que está ocurriendo dentro de mí ahora mismo","Saber qué tan intenso es lo que estoy sintiendo","Elegir qué puede ayudarme en este momento"]:
        c.setFillColor(GOLD); c.circle(x+5,y+1,3,fill=1,stroke=0)
        y=wrap(c,item,x+15,y,width-15,size=9,leading=12); y-=5
    reminder(c,"RECORDATORIO IMPORTANTE:",["Está bien no tener todas las respuestas ahora mismo.","Lo importante es ser sincero contigo mismo."],x,y-4,width)
    footer(c,"1.1"); c.save()

def page_12(path):
    c=canvas.Canvas(str(path),pagesize=A4)
    y=base(c,"1.2","Mi cuerpo me da señales","Nuestro cuerpo nos muestra cómo nos sentimos antes de que lo haga nuestra mente. Conozcamos estas señales para responder de forma amable y útil.")
    margin=35; gap=18; col=(W-2*margin-gap)/2; xl=margin; xr=margin+col+gap
    yl=section(c,1,"¿Cómo me siento en mi cuerpo?",xl,y,col)
    yl=wrap(c,"Marca las sensaciones corporales que notas.",xl,yl,col,size=7.8,leading=10)
    opts=["Corazón acelerado","Malestar estomacal","Músculos tensos","Sensación de pesadez","Calor","Entumecimiento","Pecho apretado","Necesidad de llorar"]
    for i in range(0,len(opts),2):
        yy=yl; checkbox(c,xl,yy,opts[i],7.2,95); checkbox(c,xl+col/2,yy,opts[i+1],7.2,95); yl-=22
    yl=wrap(c,"Otra:",xl,yl,col,size=7.5); yl=field_lines(c,xl,yl-5,col,1,15)
    yr=section(c,2,"¿Quién puede ayudarme?",xr,y,col)
    yr=wrap(c,"Está bien acudir a personas que te apoyen.",xr,yr,col,size=7.8,leading=10)
    for label in ["Un familiar","Una persona adulta de confianza","Un amigo o amiga","Alguien con quien hablo","Un profesor o profesora","Un orientador o terapeuta"]:
        yr=checkbox(c,xr,yr,label,7.4,col-15); yr-=5
    yr=wrap(c,"¿Qué tan fuerte siento este apoyo ahora?",xr,yr,col,size=7.5)
    c.setFillColor(TEAL); c.setFont("DV-B",8); c.drawString(xr,yr-7,"0   1   2   3   4   5   6   7   8   9   10")
    top=min(yl,yr)-8
    yl=section(c,3,"¿En qué parte del cuerpo lo siento?",xl,top,col)
    yl=wrap(c,"Marca todas las zonas donde lo sientes.",xl,yl,col,size=7.5,leading=10)
    for label in ["Cabeza","Hombros","Brazos","Garganta","Espalda","Manos","Pecho","Estómago","Piernas"]:
        yl=checkbox(c,xl,yl,label,7.2,col-15); yl-=3
    yl=wrap(c,"Lo siento sobre todo en:",xl,yl-2,col,size=7.3); yl=field_lines(c,xl,yl-5,col,1,14)
    yl=wrap(c,"Se siente como:",xl,yl-2,col,size=7.3); yl=field_lines(c,xl,yl-5,col,1,14)
    yr=section(c,4,"¿Qué ayuda a mi cuerpo a sentirse mejor?",xr,top,col)
    yr=wrap(c,"Marca lo que te ayuda.",xr,yr,col,size=7.5,leading=10)
    for label in ["Respirar lenta y profundamente","Escuchar música","Beber agua","Hablar con alguien","Descansar o sentarme en silencio","Mover el cuerpo suavemente"]:
        yr=checkbox(c,xr,yr,label,7.1,col-15); yr-=3
    yr=wrap(c,"Otra cosa que me ayuda:",xr,yr-2,col,size=7.3); yr=field_lines(c,xr,yr-5,col,1,14)
    bottom=min(yl,yr)-6
    bottom=section(c,5,"¿Qué ayuda a que mi cuerpo se calme?",margin,bottom,W-2*margin)
    for i,label in enumerate(["Esto pasará","Estoy a salvo ahora","Puedo afrontar esto","No estoy solo/a"]):
        checkbox(c,margin+(i%2)*(W-2*margin)/2,bottom-(i//2)*18,label,7.6,200)
    bottom-=42; bottom=wrap(c,"Mi frase para calmarme:",margin,bottom,W-2*margin,size=7.8); field_lines(c,margin,bottom-5,W-2*margin,1,14)
    reminder(c,"RECORDATORIO IMPORTANTE:",["Mi cuerpo no intenta hacerme daño: intenta protegerme.","Cuanto mejor lo conozco, mejor puedo cuidarlo y elegir."],margin,92,W-2*margin)
    footer(c,"1.2"); c.save()

def page_13(path):
    c=canvas.Canvas(str(path),pagesize=A4)
    y=base(c,"1.3","¿Qué me activó?","A veces algo pequeño puede despertar emociones intensas. Veamos qué ocurrió, qué pensé y cómo reaccioné.")
    m=35; g=18; col=(W-2*m-g)/2; xl=m; xr=m+col+g
    yl=section(c,1,"¿Qué ocurrió antes de la emoción?",xl,y,col)
    yl=wrap(c,"Marca la situación o el hecho que ocurrió justo antes.",xl,yl,col,size=7.4,leading=9)
    for label in ["Alguien dijo algo","Vi algo","Llamada o mensaje","Aviso o pensamiento","Un recuerdo","Tecnología o teléfono","Situación escolar","Otra cosa"]:
        yl=checkbox(c,xl,yl,label,7.0,col-15); yl-=3
    yr=section(c,2,"¿Cuál fue el desencadenante?",xr,y,col)
    yr=wrap(c,"Marca cómo apareció.",xr,yr,col,size=7.4,leading=9)
    for label in ["Algo que se dijo","Una situación","Un pensamiento","Una sensación corporal","Un lugar","Algo que vi","Algo pequeño"]:
        yr=checkbox(c,xr,yr,label,7.0,col-15); yr-=3
    yr=wrap(c,"¿Qué tan intenso fue?  0  1  2  3  4  5  6  7  8  9  10",xr,yr,col,font="DV-B",size=7)
    top=min(yl,yr)-8
    yl=section(c,3,"¿Qué pasó por mi mente?",xl,top,col)
    yl=wrap(c,"Cuando ocurrió algo, apareció un pensamiento. Escribe el pensamiento principal.",xl,yl,col,size=7.4,leading=9)
    yl=wrap(c,"Mi pensamiento fue:",xl,yl-3,col,font="DV-B",size=7.4); yl=field_lines(c,xl,yl-5,col,3,18)
    yr=section(c,4,"¿Cómo reaccioné?",xr,top,col)
    yr=wrap(c,"Marca cómo reaccionaste en ese momento.",xr,yr,col,size=7.4,leading=9)
    for label in ["Expresé la emoción","Me la guardé","Actué impulsivamente","Quise escapar","Me bloqueé","La sentí por todo el cuerpo","Me quedé paralizado/a"]:
        yr=checkbox(c,xr,yr,label,7.0,col-15); yr-=3
    bottom=min(yl,yr)-6
    bottom=section(c,5,"¿Qué hice a causa de la emoción?",m,bottom,W-2*m)
    bottom=wrap(c,"No tenía que reaccionar de esa manera. Podría haber elegido otra respuesta. Marca lo que podría ayudar.",m,bottom,W-2*m,size=7.5,leading=9)
    opts=["Expresar la emoción","Hacer una pausa","Hablar con alguien","Hacer algo que me ayude","Escribirlo","Compartirlo con alguien","Responder de otra manera"]
    for i,label in enumerate(opts):
        checkbox(c,m+(i%2)*(W-2*m)/2,bottom-(i//2)*17,label,7.0,210)
    bottom-=70; bottom=wrap(c,"La próxima vez puedo intentar:",m,bottom,W-2*m,font="DV-B",size=7.5); field_lines(c,m,bottom-5,W-2*m,1,14)
    reminder(c,"RECORDATORIO IMPORTANTE:",["No todo lo que me activa es culpa mía.","Cuando entiendo lo que ocurrió, puedo elegir una mejor respuesta la próxima vez."],m,88,W-2*m)
    footer(c,"1.3"); c.save()

def page_14(path):
    c=canvas.Canvas(str(path),pagesize=A4)
    y=base(c,"1.4","Pensamiento, emoción y acción","Un pensamiento influye en cómo nos sentimos, y eso influye en lo que hacemos. Cada parte puede afectar a las demás.")
    m=35; g=18; col=(W-2*m-g)/2; xl=m; xr=m+col+g
    yl=section(c,1,"¿Qué ocurrió?",xl,y,col)
    yl=wrap(c,"Piensa en algo que pasó. ¿Cuál fue la situación?",xl,yl,col,size=7.5,leading=9)
    for label in ["Estudios o escuela","Con amistades o compañeros","Amistad o relación","En casa","Familia","Otra cosa"]:
        yl=checkbox(c,xl,yl,label,7.0,col-15); yl-=3
    yl=wrap(c,"En pocas palabras:",xl,yl-2,col,font="DV-B",size=7.2); yl=field_lines(c,xl,yl-5,col,2,17)
    yr=section(c,2,"¿Qué estoy pensando?",xr,y,col)
    yr=wrap(c,"Observa el pensamiento que apareció. ¿A cuál se parece?",xr,yr,col,size=7.5,leading=9)
    for label in ["No soy capaz","Nadie me entiende","Es demasiado difícil","Nunca seré suficientemente bueno/a"]:
        yr=checkbox(c,xr,yr,label,7.0,col-15); yr-=4
    yr=wrap(c,"Intensidad:  0  1  2  3  4  5  6  7  8  9  10",xr,yr,col,font="DV-B",size=7)
    top=min(yl,yr)-8
    yl=section(c,3,"¿Qué estoy sintiendo?",xl,top,col)
    yl=wrap(c,"Nombra las emociones que aparecieron.",xl,yl,col,size=7.5)
    yl=wrap(c,"La emoción principal:",xl,yl-4,col,font="DV-B",size=7.2); yl=field_lines(c,xl,yl-5,col,2,17)
    yl=wrap(c,"Otra emoción que sentí:",xl,yl-2,col,font="DV-B",size=7.2); yl=field_lines(c,xl,yl-5,col,2,17)
    yr=section(c,4,"¿Qué acción realicé?",xr,top,col)
    yr=wrap(c,"Piensa en lo que realmente hiciste.",xr,yr,col,size=7.5)
    for label in ["Lo evité","Me relajé","Busqué apoyo","Me fui","Me quedé y lo afronté","Hice otra cosa"]:
        yr=checkbox(c,xr,yr,label,7.0,col-15); yr-=3
    yr=wrap(c,"¿Fue útil esta acción?",xr,yr-2,col,font="DV-B",size=7.2); yr=field_lines(c,xr,yr-5,col,1,14)
    bottom=min(yl,yr)-6
    bottom=section(c,5,"¿Qué puedo hacer en su lugar?",m,bottom,W-2*m)
    bottom=wrap(c,"¿Cómo puedo responder de una manera útil?",m,bottom,W-2*m,size=7.5)
    opts=["Hablar con alguien de confianza","Moverme o hacer ejercicio","Hacer una pausa","Elegir un pensamiento útil","Tratarme con amabilidad","Escribir cómo me siento"]
    for i,label in enumerate(opts):
        checkbox(c,m+(i%2)*(W-2*m)/2,bottom-(i//2)*17,label,7.0,210)
    bottom-=54; bottom=wrap(c,"Mi plan para la próxima vez:",m,bottom,W-2*m,font="DV-B",size=7.4); field_lines(c,m,bottom-5,W-2*m,1,14)
    reminder(c,"REFLEXIÓN RÁPIDA:",["Pensamientos, emociones y acciones se influyen entre sí.","Cuando entiendo la conexión, puedo elegir cómo responder; no tengo que reaccionar automáticamente."],m,88,W-2*m)
    footer(c,"1.4"); c.save()

def page_15(path):
    c=canvas.Canvas(str(path),pagesize=A4)
    y=base(c,"1.5","Mi mapa personal","Cuando sé lo que importa, sé qué me ayuda.")
    m=45; width=W-2*m
    y=section(c,1,"Cuando siento algo difícil, puedo:",m,y,width)
    opts=["Hablar con alguien de confianza","Mover mi cuerpo","Hacer algo que me ayude a pensar","Intentar pensar de otra manera","Esperar o reducir el ritmo","Pedir apoyo"]
    for i,label in enumerate(opts):
        checkbox(c,m+(i%2)*width/2,y-(i//2)*22,label,8.0,210)
    y-=72; y=wrap(c,"Otra opción:",m,y,width,font="DV-B",size=8); y=field_lines(c,m,y-5,width,1,16)
    y-=6; g=22; col=(width-g)/2
    yl=section(c,2,"¿Qué me ayuda a sentirme mejor?",m,y,col)
    yl=field_lines(c,m,yl,col,5,23)
    yr=section(c,3,"¿A quién puedo acudir para pedir ayuda?",m+col+g,y,col)
    yr=field_lines(c,m+col+g,yr,col,5,23)
    y=min(yl,yr)-8; y=section(c,4,"Un pequeño paso que puedo dar ahora mismo:",m,y,width)
    y=field_lines(c,m,y,width,3,22)
    y-=4; c.setFillColor(MINT); c.roundRect(m,y-60,width,60,10,fill=1,stroke=0)
    c.setFillColor(TEAL); c.setFont("DV-B",9); c.drawString(m+14,y-20,"Recordatorio útil:")
    c.setFillColor(DARK); c.setFont("DV-B",9); c.drawString(m+135,y-20,"Hoy elijo:")
    c.setStrokeColor(LINE); c.line(m+135,y-36,m+width-14,y-36)
    wrap(c,"Cuando conozco mi mapa, me resulta más fácil elegir lo que es seguro y útil.",m+14,y-38,110,size=7.2,leading=9)
    footer(c,"1.5"); c.save()

FILES = [
 ("01-01-que-me-esta-pasando-ahora-mismo.pdf", page_11),
 ("01-02-mi-cuerpo-me-da-senales.pdf", page_12),
 ("01-03-que-me-activo.pdf", page_13),
 ("01-04-pensamiento-emocion-accion.pdf", page_14),
 ("01-05-mi-mapa-personal.pdf", page_15),
]
for name, fn in FILES:
    fn(OUT/name)
    print(OUT/name)
