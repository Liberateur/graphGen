// ====================================
// Objet libgraph
// ====================================

	// Constructeur
	function libgraph(c)
	{
		this.setBuild(c);
	}

	// Méthodes
	libgraph.prototype =
	{
		// ======================
		// Général settings
		// ======================
		setBuild: function(p)
		{
			// On enregistre le parent
			this.p = p;
			
			// On set nos paramètres globaux
			this.setParams();

			// On créer notre canvas
			this.createCanvas();
		},
		setParams: function()
		{
			var t = this;
			
			// On enregistre les params
			this.params = {
							bezier:     getAttr('data-bezier',true,true),
	   						sizeLine:   getAttr('data-linesize',3,false,true),
							indicator:  getAttr('data-indicator',4,false,true),
							textInfo:   getAttr('data-infos',''),
							color:      getAttr('data-color','#999'),
							opacity:    getAttr('data-opacity',0.3,false,true),
							background: getAttr('data-background',true,true),
							delay:      getAttr('data-delay',200,false,true),
							ratioSize:  1.3
						  };

			// Récupère l'attribut et set la valeur par défaut si inexistante
			function getAttr(a,b,c,d)
			{
				// a = nom de l'attribut | b = valeur par défaut | c = si c'est un test de boleen | d = si c'est un nombre
				var a = t.p.getAttribute(a);
				return c ? ((a === 'false' ? !b : b)) : ((d ? (a ? parseInt(a) : b) : (a ? a : b)));
			}
		},
		setSize: function()
		{
			// Update width/height du canvas + enregistrement dans une this.var
			this.width  = this.c.width  = this.p.clientWidth;
			this.height = this.c.height = this.p.clientHeight;

			// On enregistre l'espace entre chaque points
			this.coords.space = this.width/(this.coords.pos.length-1);
		},
		setCords: function()
		{
			var c = [], a = 0;

			// On récupère le chiffre le plus haut du graph
			this.coords.max = Math.max.apply(Math, this.coords.pos);

			// On boucle sur les positions et définit les coordonnées x,y
			for(var i in this.coords.pos) c.push([this.coords.space*i, this.getTopPos(this.coords.pos[i])]);

			// On enregistre notre tableau de positions
			this.coords.pos = c;
		},
		setPos: function()
		{
			// On récupère les données du graph
			var psi = this.p.getAttribute('data-statsinfos').split(','),
				pos = this.p.getAttribute('data-stats').split(',');

			// On construit les coordonnées du graph
			this.coords = { stats: pos, pos: [], posinfos: [] };
			for(var i in pos)
			{
				this.coords.pos.push(parseInt(pos[i]));
				this.coords.posinfos.push(psi[i]);
			}
		},


		// ======================
		// Functions
		// ======================
		getTopPos: function(c)
		{
			return this.height*(1-(c*100/(this.coords.max*this.params.ratioSize))/100);
		},


		// ======================
		// Créations
		// ======================
		createCanvas: function()
		{
			// On créer un canvas
			var canvas = document.createElement('canvas'),
				div = document.createElement('div');

			div.className = 'canvas';
			this.c   = canvas;
			this.ctx = canvas.getContext('2d');

			// On reset le parent
			this.p.innerHTML = '';

			// On ajoute le canvas au parent
			div.appendChild(canvas); this.p.appendChild(div);

			// On créer un ul pour stocker nos stats
			var ulstats = document.createElement('ul');
			ulstats.className = 'libstats';
			// On ajoute l'ul stats et l'enregistre
			this.p.appendChild(ulstats);
			this.pstats = ulstats;

			// On créer un ul pour stocker nos infos
			var ulinfos = document.createElement('ul');
			ulinfos.className = 'libinfos';
			// On ajoute l'ul infos et l'enregistre
			this.p.appendChild(ulinfos);
			this.pinfos = ulinfos;

			// On définit les positions
			this.setPos();

			// Il faut au moins deux coordonnées pour faire fonctionner le graph
			if(this.coords.pos.length > 1)
			{
				// On définit la taille du canvas
				this.setSize();

				// On définit la liste de coordonnées
				this.setCords();

				// On créer notre graph
				this.createGraph();

				// On ajoute nos infos du graph
				this.createInfos();
			}
		},
		createInfos: function()
		{
			// On récupère la marge de chaque indicator
			var c = Math.round(this.coords.max / this.params.indicator),
				l = c.toString().length,
				p = Math.pow(10, l-1),
				g = Math.round(c/p)*p,
				n = this.coords.max > g*this.params.indicator ? 1 : 0;

			// On boucle sur le nombre d'indicators
			for (var i = 1; i <= this.params.indicator+n; i++)
			{
				// On calcul l'arrondi du nombre
				var t = g*i, li = document.createElement('li');

				li.innerHTML = t;
				li.style.bottom = (this.height-this.getTopPos(t))+'px';

				this.pinfos.appendChild(li);
			}
		},
		createBulle: function(n,posx,posy,i)
		{
			// On créer la bubulle
			var li = document.createElement('li'),
				infos = this.coords.posinfos[i] ? '<span class="subinfos">'+this.coords.posinfos[i]+'</span>' : '';

			li.style.left = (posx-this.coords.space/2)+'px';
			li.style.width = this.coords.space+'px';
			li.innerHTML = '<div class="stats" style="top: '+posy+'px">'+
							  '<span class="bulle" style="background:'+this.params.color+'"></span>'+
							  '<span class="value">'+n+' '+this.params.textInfo+'</span>'+
						   '</div>'+
						   infos;

			// On ajoute la bubulle
			this.pstats.appendChild(li);
		},
		createGraph: function()
		{
			// Nouvelle forme
			this.ctx.beginPath();

			// Paramètes (couleurs + taille de la ligne)
			this.ctx.strokeStyle = this.ctx.fillStyle = this.params.color;
			this.ctx.lineWidth   = this.params.sizeLine;

			// Si bezier est activé
			if(this.params.bezier) var base = this.coords.pos[1][0]/2;

			var last = this.coords.pos[0];

			// Placement du premier point
			this.ctx.moveTo(last[0], last[1]);
			this.createBulle(this.coords.stats[0], last[0], last[1], 0);

			// On boucle sur tous les points à partir du deuxième
			for(var i = 1; i < this.coords.pos.length; i++)
			{
				var e = this.coords.pos[i];

				if(!this.params.bezier)
				{
					this.ctx.lineTo(e[0], e[1]);
				}
				else
				{
					this.ctx.bezierCurveTo((last[0]+base), last[1], (e[0]-base), e[1], e[0], e[1]);
					last = e;
				}

				this.createBulle(this.coords.stats[i], e[0], e[1], i);
			}

			// On applique l'opacité
			this.ctx.globalAlpha = this.params.opacity;

			// On trace le contour
			this.ctx.stroke();

			// Si l'on met un background
			if(this.params.background)
			{
				// On ferme le contour pour construire le background
				this.ctx.lineTo(this.width, this.height);
				this.ctx.lineTo(0, this.height);

				// On rempli la forme fermée
				this.ctx.fill();
			}

			// On termine la forme
			this.ctx.closePath();
		},


		// ======================
		// Affichage
		// ======================
		show: function()
		{
			var t = this, c = this.pstats.childNodes;

			// On lance le tracée du graph en décalé
			setTimeout(function() { t.p.className += ' libactive'; }, t.params.delay*c.length);

			// On boucle sur les points et les affiche un puis l'autre
			for(var i in c) s(c[i],i);

			function s(c,i)
			{
				setTimeout(function(){ c.className += ' libactive'; }, t.params.delay*i);
			}
		}
	}

// ====================================
// Traitement de la page
// ====================================

	var c = document.getElementsByClassName('libgraph'), cs = {};

	// On boucle sur tous les .libgraph
	for(var i = 0; i < c.length; i++) cs[i] = new libgraph(c[i]).show();
