"""
Serializers for the assignments app.
"""
from rest_framework import serializers
from .models import Assignment, Question, Submission, Answer


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = (
            'id', 'question_text', 'option_a', 'option_b',
            'option_c', 'option_d', 'correct_option', 'marks',
        )
        # Hide correct_option from students
        extra_kwargs = {
            'correct_option': {'write_only': False},
        }


class QuestionStudentSerializer(serializers.ModelSerializer):
    """Serializer for students - hides correct answer."""
    class Meta:
        model = Question
        fields = (
            'id', 'question_text', 'option_a', 'option_b',
            'option_c', 'option_d', 'marks',
        )


class AssignmentSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    total_marks = serializers.ReadOnlyField()
    question_count = serializers.SerializerMethodField()
    is_submitted = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = (
            'id', 'course', 'title', 'description', 'due_date',
            'created_by', 'created_at', 'questions', 'total_marks',
            'question_count', 'is_submitted',
        )
        read_only_fields = ('id', 'created_at', 'created_by')

    def get_questions(self, obj):
        request = self.context.get('request')
        if request and request.user.role == 'student':
            return QuestionStudentSerializer(obj.questions.all(), many=True).data
        return QuestionSerializer(obj.questions.all(), many=True).data

    def get_question_count(self, obj):
        return obj.questions.count()

    def get_is_submitted(self, obj):
        request = self.context.get('request')
        if request and request.user.role == 'student':
            return Submission.objects.filter(
                student=request.user, assignment=obj
            ).exists()
        return None


class QuestionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = (
            'question_text', 'option_a', 'option_b',
            'option_c', 'option_d', 'correct_option', 'marks',
        )


class AssignmentCreateSerializer(serializers.ModelSerializer):
    questions = QuestionCreateSerializer(many=True, write_only=True)

    class Meta:
        model = Assignment
        fields = ('id', 'course', 'title', 'description', 'due_date', 'questions')

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        assignment = Assignment.objects.create(**validated_data)
        for q_data in questions_data:
            Question.objects.create(assignment=assignment, **q_data)
        return assignment


class AnswerSubmitSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_option = serializers.ChoiceField(choices=['a', 'b', 'c', 'd'])


class SubmissionCreateSerializer(serializers.Serializer):
    answers = AnswerSubmitSerializer(many=True)


class AnswerResultSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text')
    correct_option = serializers.CharField(source='question.correct_option')
    marks = serializers.IntegerField(source='question.marks')
    is_correct = serializers.ReadOnlyField()

    class Meta:
        model = Answer
        fields = (
            'id', 'question_id', 'question_text', 'selected_option',
            'correct_option', 'marks', 'is_correct',
        )


class SubmissionSerializer(serializers.ModelSerializer):
    answers = AnswerResultSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    total_marks = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = (
            'id', 'student', 'student_name', 'assignment', 'assignment_title',
            'submitted_at', 'score', 'is_evaluated', 'answers', 'total_marks',
        )

    def get_total_marks(self, obj):
        return obj.assignment.total_marks
