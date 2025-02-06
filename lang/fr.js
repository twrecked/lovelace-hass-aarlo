

export var messages = {

	// image viewer
	image: {
		turn_camera_on:    'allume la caméra',
		turn_camera_off:   'éteins la caméra',
		take_a_snapshot:   'prends une photo',
		start_stream:      'visionne le livestream',
		stop_stream:       'arrête le livestream',
		automatic_capture: 'capturée automatiquement à',
		snapshot_capture:  'image instantanée capturée à',
		feature_disabled:  'camera éteinte, aucune image',
	},
	
	// library viewer
	library: {
		first_page:    'première page',
		previous_page: 'page précédente',
		next_size:     'taille de grille suivante',
		close:         'ferme la bibliothèque',
		next_page:     'page suivante',
		last_page:     'dernière page',
		captured:      'capturée',
		duration:      'durée',
		reason:        'raison',
	},

	// video/stream viewer
	video: {
		stop:       'arrêt',
		play:       'lecture',
		pause:      'pause',
		fullscreen: 'plein écran',
	},

	// device statuses
	status: {
		battery_strength:   'puissance batterie',
		detected:           'détecté',
		door_closed:        'porte fermée',
		door_open:          'porte ouverte',
		captured:           'capturée',
		captured_nothing:   'rien aujourd’hui',
		captured_something: 'clips d’aujourd’hui, capturés à',
		clear:              'sans mouvement',
		plugged_in:         'branchée',
		signal_strength:    'intensité du signal',
		motion:             'mouvement',
		sound:              'son',
		lock_locked:        'verrouillée. appuyez pour déverrouiller',
		lock_unlocked:      'déverrouillée. appuyer pour verrouiller',
		doorbell_pressed:   'Dring-dring !',
		doorbell_idle:      'en attente',
		doorbell_mute:      'couper la sonnerie',
		doorbell_muted:     'sonnerie coupée, appuyer pour réactiver',
		light_on:           'lumière allumée',
		light_off:          'lumière éteinte',
		next_camera:        'caméra suivante',
		previous_camera:    'caméra précédente',
		library:            'Enregistrements',
		library_empty:      'Aucun enregistrement',
		library_open:       'appuyer pour ouvrir',
	},
	
	// known triggers
	trigger : {
		animal:  'animal',
		vehicle: 'véhicule',
		person:  'personne',
		package: 'colis',
	},

	// camera states
	state: {
		off:                "Off",
		idle:               "En attente",
		recording:          "Ca tourne !",
		streaming:          "Live",
		recording_snapshot: "Enregistrement + Snapshot",
		streaming_snapshot: "Live + Snapshot",
		taking_snapshot:    "Snapshot",
		recently_active:    "Active récemment",
		unavailable:        "Indisponible",
		offline_too_cold:   "Hors line, Trop froid !",
	}
}
