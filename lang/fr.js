

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
		feature_disabled:  'camera off, feature disabled'
	},
	
	// library viewer
	library: {
		first_page:    'première page',
		previous_page: 'page précédente',
		next_size:     'prochaine taille de grille',
		close:         'ferme la bibliothèque',
		next_page:     'prochaine page',
		last_page:     'dernière page',
		captured:      'capturée',
	},

	// video/stream viewer
	video: {
		stop:       'arrête',
		play:       'joue',
		pause:      'pause',
		fullscreen: 'plein écran',
	},

	// device statuses
	status: {
		battery_strength:   'puissance batterie',
		detected:           'détecté',
		door_closed:        'fermée',
		door_open:          'ouverte',
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
		doorbell_pressed:   'Dring-dring!',
		doorbell_idle:      'en attente',
		doorbell_mute:      'click to mute',
		doorbell_muted:     'muted, click to unmute',
		light_on:           'allumé',
		light_off:          'éteint',
		next_camera:        'prochaine caméra',
		previous_camera:    'caméra précédente',
		library:            'library',
		library_empty:      'no recordings available',
		library_open:       'click to open',
	},
	
	// known triggers
	trigger : {
		animal:  'animal',
		vehicle: 'véhicule',
		person:  'personne',
		parcel:  'colis',
	},

	// camera states
	state: {
		off:                "Off",
		idle:               "Idle",
		recording:          "Recording",
		streaming:          "Streaming",
		recording_snapshot: "Recording + Snapshot",
		streaming_snapshot: "Streaming + Snapshot",
		taking_snapshot:    "Taking Snapshot",
		recently_active:    "Recently Active",
		unavailable:        "Unavailable",
		offline_too_cold:   "Offline, Too Cold",
	}
}
