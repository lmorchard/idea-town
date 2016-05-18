from unittest.mock import patch

import json

from django.core.urlresolvers import reverse
from django.contrib.auth.models import User

from rest_framework import fields

from testfixtures import LogCapture

from ..base.logging import JsonLogFormatter
from ..utils import gravatar_url, TestCase
from ..users.models import UserProfile
from .models import (Experiment, ExperimentTourStep, UserInstallation,
                     Feature, FeatureState, FeatureCondition)

import logging
logger = logging.getLogger(__name__)


class BaseTestCase(TestCase):

    maxDiff = None

    def setUp(self):
        super(BaseTestCase, self).setUp()

        self.handler = LogCapture()

        self.username = 'johndoe2'
        self.password = 'trustno1'
        self.email = '%s@example.com' % self.username

        self.user = User.objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password)

        self.users = dict((obj.username, obj) for obj in (
            User.objects.create_user(
                username='experimenttest-%s' % idx,
                email='experimenttest-%s@example.com' % idx,
                password='trustno%s' % idx
            ) for idx in range(0, 5)))

        self.experiments = dict((obj.slug, obj) for (obj, created) in (
            Experiment.objects.get_or_create(
                slug="test-%s" % idx, defaults=dict(
                    order=idx,
                    title="Longer Test Title %s" % idx,
                    short_title="Test %s" % idx,
                    description="This is a test",
                    introduction="<h1>Hello, Test!</h1>",
                    addon_id="addon-%s@example.com" % idx
                )) for idx in range(1, 4)))

    def tearDown(self):
        self.handler.uninstall()


class ExperimentViewTests(BaseTestCase):

    def test_index(self):
        """Experiment list API resource should include all experiments"""
        url = reverse('experiment-list')
        resp = self.client.get(url)
        # HACK: Use a rest framework field to format dates as expected
        date_field = fields.DateTimeField()
        self.assertJSONEqual(
            str(resp.content, encoding='utf8'),
            {
                "count": 3,
                "next": None,
                "previous": None,
                "results": sorted(
                    ({
                        "id": experiment.pk,
                        "url": "http://testserver/api/experiments/%s" %
                               experiment.pk,
                        "title": experiment.title,
                        "short_title": experiment.short_title,
                        "order": experiment.order,
                        "slug": experiment.slug,
                        "thumbnail": None,
                        "description": experiment.description,
                        "introduction": experiment.introduction.rendered,
                        "measurements": experiment.measurements.rendered,
                        "version": experiment.version,
                        "changelog_url": experiment.changelog_url,
                        "contribute_url": experiment.contribute_url,
                        "bug_report_url": experiment.bug_report_url,
                        "privacy_notice_url": experiment.privacy_notice_url,
                        "addon_id": experiment.addon_id,
                        "gradient_start": experiment.gradient_start,
                        "gradient_stop": experiment.gradient_stop,

                        "created": date_field.to_representation(
                            experiment.created),
                        "modified": date_field.to_representation(
                            experiment.modified),
                        "xpi_url": "",
                        "tour_steps": [],
                        "details": [],
                        "contributors": [],
                        "survey_url": "https://qsurvey.mozilla.com/s3/%s" %
                        experiment.slug,
                        "installation_count": UserInstallation.objects
                        .distinct('user').filter(experiment=experiment)
                        .count(),
                        "installations_url":
                            "http://testserver/api/experiments/%s/installations/" %
                            experiment.pk,
                    } for (slug, experiment) in self.experiments.items()),
                    key=lambda x: x['id'])
            }
        )

    def test_tour_steps(self):
        # lang = 'en-US'
        experiment = self.experiments['test-1']
        steps = [ExperimentTourStep.objects.create(
            experiment=experiment, order=idx, copy='Caption %s' % idx
        ) for idx in range(1, 4)]

        url = reverse('experiment-detail', args=(experiment.pk,))
        resp = self.client.get(url)
        data = json.loads(str(resp.content, encoding='utf8'))

        self.assertEqual(len(steps), len(data['tour_steps']))
        for idx in range(0, len(steps)):
            step = steps[idx]
            result = data['tour_steps'][idx]
            self.assertEqual(step.copy.rendered, result['copy'])
            self.assertEqual(step.order, result['order'])

    def test_contributors(self):
        """Experiment detail API resource should list contributor profiles"""
        users = [
            self.users['experimenttest-1'],
            self.users['experimenttest-2']
        ]

        profiles = [
            UserProfile.objects.get_profile(users[0]),
            UserProfile.objects.get_profile(users[1])
        ]

        profiles[0].title = 'chief cat wrangler'
        profiles[0].display_name = 'jane doe'
        profiles[0].save()

        profiles[1].title = 'assistant cat wrangler'
        profiles[1].display_name = 'john doe'
        profiles[1].save()

        experiment = self.experiments['test-1']
        experiment.contributors.add(users[0])
        experiment.contributors.add(users[1])

        url = reverse('experiment-detail', args=(experiment.pk,))
        resp = self.client.get(url)
        result = json.loads(str(resp.content, encoding='utf8'))

        contributors = result.get('contributors', None)
        self.assertIsNotNone(contributors)

        for idx in range(0, 2):
            profile = profiles[idx]
            user = users[idx]
            contributor = contributors[idx]

            self.assertEqual(contributor['username'], user.username)
            self.assertEqual(contributor['display_name'], profile.display_name)
            self.assertEqual(contributor['title'], profile.title)

            self.assertEqual(contributor['avatar'], gravatar_url(user.email))

    def test_installations(self):
        """Experiments should support an /installations/ psuedo-collection"""
        user = self.user
        experiment = self.experiments['test-1']
        client_id = '8675309'

        # Ensure list GET without authentication is a 403
        url = reverse('experiment-installation-list',
                      args=(experiment.pk,))
        resp = self.client.get(url)
        self.assertEqual(403, resp.status_code)

        self.client.login(username=self.username,
                          password=self.password)

        # Ensure the installation to be created is initially 404
        url = reverse('experiment-installation-detail',
                      args=(experiment.pk, client_id))
        resp = self.client.get(url)
        self.assertEqual(404, resp.status_code)

        # Create the first installation of interest
        UserInstallation.objects.create(
            experiment=experiment, user=user, client_id=client_id)

        # Also create a few installations that shouldn't appear in results
        UserInstallation.objects.create(
            experiment=self.experiments['test-2'], user=user,
            client_id=client_id)

        UserInstallation.objects.create(
            experiment=experiment, user=self.users['experimenttest-1'],
            client_id='someotherclient')

        # Ensure that the desired installation appears in the API list result
        data = self.jsonGet('experiment-installation-list',
                            experiment_pk=experiment.pk)
        self.assertEqual(1, len(data))
        self.assertEqual(client_id, data[0]['client_id'])

        # Ensure that the desired installation is found at its URL
        url = reverse('experiment-installation-detail',
                      args=(experiment.pk, client_id))
        resp = self.client.get(url)
        self.assertEqual(200, resp.status_code)

        # Create another client installation via PUT
        self.handler.records = []
        client_id_2 = '123456789'
        url = reverse('experiment-installation-detail',
                      args=(experiment.pk, client_id_2))
        resp = self.client.put(url, {})
        self.assertEqual(200, resp.status_code)

        # Ensure that a testpilot.test-install log event was emitted
        record = self.handler.records[0]
        formatter = JsonLogFormatter(logger_name='testpilot.test-install')
        details = json.loads(formatter.format(record))
        fields = details['Fields']

        self.assertEqual('testpilot.test-install', record.name)
        self.assertEqual(fields['uid'], user.id)
        self.assertEqual(fields['context'], experiment.title)

        # Ensure that the API list result reflects the addition
        data = self.jsonGet('experiment-installation-list',
                            experiment_pk=experiment.pk)
        self.assertEqual(2, len(data))

        # Delete the new client installation with DELETE
        client_id_2 = '123456789'
        url = reverse('experiment-installation-detail',
                      args=(experiment.pk, client_id_2))
        resp = self.client.delete(url)
        self.assertEqual(410, resp.status_code)

        # Ensure that the API list result reflects the deletion
        data = self.jsonGet('experiment-installation-list',
                            experiment_pk=experiment.pk)
        self.assertEqual(1, len(data))


class FeaturesBasicTests(BaseTestCase):

    def setUp(self):
        super(FeaturesBasicTests, self).setUp()

        self.client.login(username=self.username,
                          password=self.password)

        self.experiment = self.experiments['test-1']
        self.client_id = '8675309'

        self.installation = UserInstallation.objects.create(
            user=self.user, experiment=self.experiment,
            client_id=self.client_id)

        self.feature1_title = 'frobulation'
        feature1 = Feature.objects.create(
            experiment=self.experiment, slug=self.feature1_title,
            title=self.feature1_title, default_active=False)

        FeatureState.objects.create(
            installation=self.installation, feature=feature1, active=True)

        self.feature2_title = 'reticulation'
        Feature.objects.create(
            experiment=self.experiment, slug=self.feature2_title,
            title=self.feature2_title, default_active=True)

    def test_get_features_utility(self):
        """get_features_for_installation utility should yield feature flags"""
        result = self.installation.features
        self.assertEqual(result, {
            self.feature1_title: True,
            self.feature2_title: True
        })

    def test_features_list(self):
        """Features list for installation should be an accessible resource"""
        result = self.jsonGet('features-list',
                              experiment_pk=self.experiment.pk,
                              client_id=self.client_id)
        self.assertEqual(result, {
            self.feature1_title: True,
            self.feature2_title: True
        })

    def test_me_list(self):
        """/api/me installation listing should include feature flags"""
        result = self.jsonGet('me-list')
        self.assertEqual(result['installed'][0]['features'], {
            self.feature1_title: True,
            self.feature2_title: True
        })


class FeatureConditionTests(BaseTestCase):

    def setUp(self):
        super(FeatureConditionTests, self).setUp()

        self.experiment = self.experiments['test-1']

        self.user1 = self.users['experimenttest-0']
        self.user2 = self.users['experimenttest-1']
        self.user3 = self.users['experimenttest-2']

        self.installation1 = UserInstallation.objects.create(
            experiment=self.experiment, user=self.user1,
            client_id='8675309-0')

        self.installation2 = UserInstallation.objects.create(
            experiment=self.experiment, user=self.user2,
            client_id='8675309-1')

        self.installation3 = UserInstallation.objects.create(
            experiment=self.experiment, user=self.user3,
            client_id='8675309-2')

        self.feature1 = Feature.objects.create(
            experiment=self.experiment, slug='frobulation',
            title='frobulation', default_active=False)

        self.feature2 = Feature.objects.create(
            experiment=self.experiment, slug='reticulation',
            title='reticulation', default_active=False)

        self.feature3 = Feature.objects.create(
            experiment=self.experiment, slug='encabulation',
            title='encabulation', default_active=False)

    def test_random_bucket(self):

        FeatureCondition.objects.create(
            experiment=self.experiment,
            operator='random_bucket',
            argument=json.dumps([
                self.feature1.slug,
                self.feature2.slug,
                self.feature3.slug
            ])
        )

        with patch('random.choice') as mock_choice:

            mock_choice.return_value = self.feature1.slug
            self.assertEqual(self.installation1.features, {
                self.feature1.slug: True,
                self.feature2.slug: False,
                self.feature3.slug: False,
            })

            mock_choice.return_value = self.feature2.slug
            self.assertEqual(self.installation2.features, {
                self.feature1.slug: False,
                self.feature2.slug: True,
                self.feature3.slug: False,
            })

            mock_choice.return_value = self.feature3.slug
            self.assertEqual(self.installation3.features, {
                self.feature1.slug: False,
                self.feature2.slug: False,
                self.feature3.slug: True,
            })
