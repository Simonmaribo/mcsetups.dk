import { register } from 'tsconfig-paths'

register({
	baseUrl: './dist',
	paths: {
		'@/interfaces/*': ['interfaces/*'],
		'@/libs/*': ['libs/*'],
		'@/managers/*': ['managers/*'],
		'@/routes/*': ['routes/*'],
		'@/tasks/*': ['tasks/*'],
		'@/types/*': ['types/*'],
	},
})
