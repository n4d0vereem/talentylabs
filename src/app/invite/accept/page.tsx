'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InvitationInfo {
  email: string;
  role: string;
  agencyName: string;
}

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  // 1. Vérifier le token au chargement
  useEffect(() => {
    if (!token) {
      setError('Token d\'invitation manquant');
      setLoading(false);
      return;
    }
    
    verifyToken();
  }, [token]);
  
  async function verifyToken() {
    try {
      const res = await fetch(`/api/invites/${token}`);
      const data = await res.json();
      
      if (!data.success) {
        setError(data.error);
        return;
      }
      
      setInvitation(data.invitation);
    } catch (err) {
      setError('Erreur lors de la vérification de l\'invitation');
    } finally {
      setLoading(false);
    }
  }
  
  // 2. Gérer la soumission du formulaire
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!formData.name || formData.name.length < 2) {
      setError('Nom requis (min 2 caractères)');
      return;
    }
    
    if (!formData.password || formData.password.length < 8) {
      setError('Mot de passe requis (min 8 caractères)');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    setError(null);
    setSubmitting(true);
    
    try {
      const res = await fetch(`/api/invites/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password
        })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        setError(data.error);
        return;
      }
      
      // Succès ! Rediriger vers la page de connexion
      router.push('/sign-in?invited=true');
    } catch (err) {
      setError('Erreur lors de la création du compte');
    } finally {
      setSubmitting(false);
    }
  }
  
  // 3. États d'affichage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
          <p className="text-gray-600">Vérification de l'invitation...</p>
        </div>
      </div>
    );
  }
  
  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">
            Invitation invalide
          </h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/sign-in')} variant="outline">
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }
  
  // 4. Formulaire d'acceptation
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold mb-2">
              Accepter l'invitation
            </h1>
            <p className="text-gray-600">
              Vous avez été invité à rejoindre{' '}
              <strong className="text-black">{invitation?.agencyName}</strong> en tant que{' '}
              <strong className="text-black">
                {invitation?.role === 'TALENT_MANAGER' ? 'Talent Manager' : 'Talent'}
              </strong>
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (lecture seule) */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={invitation?.email || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
            
            {/* Nom */}
            <div>
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jean Dupont"
                required
                autoFocus
              />
            </div>
            
            {/* Mot de passe */}
            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 8 caractères"
                required
              />
            </div>
            
            {/* Confirmation mot de passe */}
            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Retapez votre mot de passe"
                required
              />
            </div>
            
            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-red-600 text-sm">
                {error}
              </div>
            )}
            
            {/* Bouton de soumission */}
            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Création du compte...
                </>
              ) : (
                'Créer mon compte'
              )}
            </Button>
          </form>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            En créant votre compte, vous acceptez les conditions d'utilisation.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
