//ZMIANA KIERUNKÓW

function direction(dir){

	switch(dir)
	{
		case 'N':
		{map.getView().setRotation(N_dir);
		}
		break;
		
		case 'S':
		{map.getView().setRotation(S_dir);
		}
		break;
		
		case 'W':
		{map.getView().setRotation(W_dir);
		}
		break;
		
		case 'E':
		{map.getView().setRotation(E_dir);
		}
		break;
		
		default:
		{map.getView().setRotation(N_dir);
		}
	}
}